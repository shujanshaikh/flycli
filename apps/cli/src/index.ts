
import { resolve } from "node:path";
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
  
  const DEV_PORT = 3100;
  const APP_PORT = appPort || 3000;

  if (verbose) {
    console.log(chalk.blue(`Starting flycli...`));
    console.log(chalk.gray(`Workspace: ${workspace}`));
    console.log(chalk.gray(`Proxy port: ${DEV_PORT}`));
    console.log(chalk.gray(`App port: ${APP_PORT}`));
  }

  const _dirname = import.meta.dir;
  const possibleToolbarPaths = [
    resolve(_dirname, '../../toolbar/dist'),
    resolve(_dirname, '../toolbar/dist'),
    resolve(_dirname, 'toolbar/dist'),
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

  const toolbarHtmlTemplate = await Bun.file(resolve(toolbarPath!, 'index.html')).text();

  const server = Bun.serve({
    port: DEV_PORT,
    
    async fetch(req, server) {
      const url = new URL(req.url);

      if (url.pathname === '/agent') {
        const upgraded = server.upgrade(req);
        if (upgraded) return undefined;
        return new Response("WebSocket upgrade failed", { status: 500 });
      }

    
      if (url.pathname.startsWith('/assets/')) {
        const assetPath = resolve(toolbarPath!, url.pathname.slice(1));
        const file = Bun.file(assetPath);
        
        if (await file.exists()) {
          return new Response(file);
        }
        return new Response("Not Found", { status: 404 });
      }

      if (url.pathname.startsWith('/{') || url.pathname === '/') {
        const toolbarHtml = toolbarHtmlTemplate.replace(
          '</head>',
          `<script>window.FLYCLI_APP_PORT = ${APP_PORT};</script></head>`
        );
        
        return new Response(toolbarHtml, {
          headers: { 'Content-Type': 'text/html' }
        });
      }

      try {
        const proxyUrl = `http://localhost:${APP_PORT}${url.pathname}${url.search}`;
        const proxyReq = new Request(proxyUrl, {
          method: req.method,
          headers: req.headers,
          body: req.body,
        });
        
        return await fetch(proxyReq);
      } catch (error) {
        return new Response(`Proxy Error: ${error}`, { status: 502 });
      }
    },

    websocket: {
      open(ws) {
        if (verbose) {
          console.log(chalk.green('Client connected'));
        }
      },

      async message(ws, message) {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'list-files') {
            const files = getFiles(process.cwd());
            ws.send(JSON.stringify({ type: "file_list", files }));
            return;
          }
          
          if (data.type === "terminal") {
            const terminalResult = runTerminalCommand(data.command);
            ws.send(JSON.stringify({ 
              type: "terminal_result", 
              stdout: terminalResult.stdout, 
              stderr: terminalResult.stderr, 
              success: terminalResult.success 
            }));
            return;
          }

          const result = await createAgent(message as WSMessage);
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
      },

      close(ws) {
        if (verbose) {
          console.log(chalk.yellow('Client disconnected'));
        }
      },
    },
  });

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

  return server;
}

if (import.meta.main) {
  startServer();
}