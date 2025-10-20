import express, { type Request, type Response } from "express";
import { DEV_PORT, PORT, proxy } from "./proxy";
import { fileURLToPath } from "bun";
import { dirname, resolve } from "node:path";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { WebSocketServer } from "ws";
import { createAgent } from "@repo/agent/agent";
import type { WSMessage } from 'agents';
import { WebSocket } from "ws";
import type { SendMessagesParams } from "../../agent/ws-transport";
import { smoothStream, stepCountIs , convertToModelMessages , streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { google } from "@ai-sdk/google";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(proxy);

app.use(express.json());


const _dirname = dirname(fileURLToPath(import.meta.url));

// Set up basic middleware and static routes
const toolbarPath = Bun.env.NODE_ENV === 'production'
    ? resolve(_dirname, '../../toolbar/dist')
    : resolve(_dirname, '../../toolbar/dist');

// Serve React app static assets
app.use('/assets', express.static(resolve(toolbarPath, 'assets')));

// Serve the main React toolbar app
app.get('/{*splat}', (req: Request, res: Response) => {
    // Read the React toolbar HTML
    const toolbarHtml = readFileSync(
      resolve(toolbarPath, 'index.html'),
      'utf-8'
    );

    res.send(toolbarHtml);
  });

app.disable('x-powered-by');


const openrouter = createOpenRouter({
  apiKey: Bun.env.OPENROUTER_API_KEY,
});


wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (message: WSMessage) => {
      try {
        const result = await createAgent(message);
        for await (const chunk of result.toUIMessageStream()) {
          //console.log(chunk)
          ws.send(JSON.stringify(chunk));
        }
      } catch (error) {
        console.error('Error handling message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Error creating agent',
          error: (error as Error).message,
        }));
        ws.close();
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });



// server.on("upgrade", (_req, socket, head) => {

// })


server.listen(DEV_PORT, () => {
    console.log(`Server is running on port ${DEV_PORT}`);
});