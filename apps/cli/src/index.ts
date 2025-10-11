import express, { type Request, type Response } from "express";
import { DEV_PORT, PORT, proxy } from "./proxy";
import { fileURLToPath } from "bun";
import { dirname, resolve } from "node:path";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { WebSocketServer } from "ws";
import { createAgent } from "@repo/agent/agent";

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


wss.on('connection', (ws: any) => {
    console.log('Client connected');
    
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(data)
        
        
        // Handle different message types
        switch (data.type) {
          case 'chat_message':
            // try {
            //   const response = await createAgent(data.content ?? "Edit the file in the web folder edit the page.tsx and make a simple ui for this website ");
            //   ws.send(JSON.stringify({ type: 'agent_message', content: response }));
            // } catch (err) {
            //   console.error('Agent error:', err);
            //   ws.send(JSON.stringify({ type: 'agent_message', content: 'Sorry, something went wrong running the agent.' }));
            // }
            // break;
            console.log('chat_message', data.content)
            break;
          case 'element_selected':
            // We'll implement this in Step 4
            break;
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
  


server.on("upgrade", (_req, socket, head) => {

})


server.listen(DEV_PORT, () => {
    console.log(`Server is running on port ${DEV_PORT}`);
});