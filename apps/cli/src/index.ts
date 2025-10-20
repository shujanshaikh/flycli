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
        console.log(message.toString())
        const data = JSON.parse(message as string) as SendMessagesParams
        console.log(data.messages)
        const result = streamText({
         messages: convertToModelMessages(data.messages),
         model: google("gemini-2.5-flash-preview-09-2025"),
         stopWhen: stepCountIs(20), // Stop after 5 steps with tool calls
         system: "You are a helpful assistant",
         experimental_transform: smoothStream({
           delayInMs: 20,
           chunking: "word",
         }),
          //  tools: { 
          //    editFiles: editFiles,
          //    readFile: readFile,
          //    list: list,
          //    glob: globTool,
          //    deleteFile: deleteFile,
          //    grep: grepTool, 
          //   },
       });
   
       // Handle streaming text chunks using UIMessageStream
       for await (const chunk of result.toUIMessageStream()) {
         //console.log(chunk)
         ws.send(JSON.stringify(chunk));
       }


  
      } catch (error) {
        console.error('Error handling message:', error);
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