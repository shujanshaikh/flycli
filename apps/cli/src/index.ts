import express, { type Request, type Response } from "express";
import { createProxyMiddleware } from "./proxy.js";
import { fileURLToPath } from "bun";
import { dirname, resolve } from "node:path";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { WebSocketServer } from "ws";
import { createAgent } from "@repo/agent/agent";
import type { WSMessage } from 'agents';
import chalk from "chalk";
import {
  port as cliPort,
  appPort as cliAppPort,
  workspace,
  verbose,
  silent,
} from "./config/parser.js";
import { getFiles } from "./utils/get-files.js";
import { runTerminalCommand } from "./utils/terminal.js";
import { pomptNumber } from "./utils/user-prompt.js";



export async function startServer() {
  const appPort = await pomptNumber({
    message: 'Enter the port number for the development server',
    default: 3000,
  });
  const DEV_PORT =  3100;
  const APP_PORT = appPort || 3000;

  if (verbose) {
    console.log(chalk.blue(`Starting flycli...`));
    console.log(chalk.gray(`Workspace: ${workspace}`));
    console.log(chalk.gray(`Proxy port: ${DEV_PORT}`));
    console.log(chalk.gray(`App port: ${APP_PORT}`));
  }

  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/agent' });

  // Create proxy with dynamic port
  const proxy = createProxyMiddleware(APP_PORT);
  app.use(proxy);

  app.use(express.json());

  const _dirname = dirname(fileURLToPath(import.meta.url));

  // Set up basic middleware and static routes
  // Try to find toolbar in multiple possible locations
  const possibleToolbarPaths = [
    resolve(_dirname, '../../toolbar/dist'), // Local development
    resolve(_dirname, '../toolbar/dist'),    // When published as npm package
    resolve(_dirname, 'toolbar/dist'),       // Alternative package structure
  ];

  const toolbarPath = possibleToolbarPaths.find((path) => {
    try {
      return Bun.file(resolve(path, 'index.html')).size > 0;
    } catch {
      return false;
    }
  }) || possibleToolbarPaths[0];

  if (verbose) {
    console.log(chalk.gray(`Toolbar path: ${toolbarPath}`));
  }

  // Serve React app static assets
  app.use('/assets', express.static(resolve(toolbarPath!, 'assets')));

  // Serve the main React toolbar app
  app.get('/{*splat}', (req: Request, res: Response) => {
    // Read the React toolbar HTML
   
    // const toolbarHtml = readFileSync(
    //   resolve(toolbarPath!, 'index.html'),
    //   'utf-8'
    // );



    let toolbarHtml = readFileSync(
      resolve(toolbarPath!, 'index.html'),
      'utf-8'
    );

    // Inject the dynamic APP_PORT into the HTML
    toolbarHtml = toolbarHtml.replace(
      '</head>',
      `<script>window.FLYCLI_APP_PORT = ${APP_PORT};</script></head>`
    );

    res.send(toolbarHtml);
  });

  app.disable('x-powered-by');


  wss.on('connection', (ws) => {
    if (verbose) {
      console.log(chalk.green('Client connected'));
    }

    ws.on('message', async (message: WSMessage) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'list-files') {
          const files = getFiles(process.cwd());
          ws.send(JSON.stringify({ type: "file_list", files }));
          return;
        }
        
        if(data.type === "terminal"){
          const terminalResult = runTerminalCommand(data.command);
          ws.send(JSON.stringify({ type: "terminal_result", stdout: terminalResult.stdout, stderr: terminalResult.stderr, success: terminalResult.success }));
          return;
        }

        const result = await createAgent(message);
        for await (const chunk of result.toUIMessageStream()) {
          ws.send(JSON.stringify(chunk));
        }
      } catch (error) {
        console.error('Error handling message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Error handling message',
          error: (error as Error).message,
        }));
      }
    });

    ws.on('close', () => {
      if (verbose) {
        console.log(chalk.yellow('Client disconnected'));
      }
    });
  });

  server.listen(DEV_PORT, () => {
    if (!silent) {
      const bar = chalk.bgGreen.black.bold(' flycli ');
      const check = chalk.green.bold('✔');
      console.log(`\n${bar} ${check} ${chalk.whiteBright('flycli is now running!')}\n`);
      console.log(`  ${chalk.cyan('Toolbar:')}      ${chalk.underline(`http://localhost:${DEV_PORT}`)}`);
      console.log(`  ${chalk.cyan('Proxying:')}     ${chalk.underline(`http://localhost:${APP_PORT}`)}`);
      console.log(
        chalk.gray(
          `\n  ${chalk.yellow('TIP:')} Make sure your development server is running on port ${APP_PORT}.\n`
        )
      );
    }
  });
}

// If this file is run directly, start the server
if (import.meta.main) {
  startServer();
}