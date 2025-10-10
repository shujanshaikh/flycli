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

// const createHTMLToolbar = (_req: Request, res: Response) => {

//     const html = `<!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
//     <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
//     <meta http-equiv="Pragma" content="no-cache">
//     <meta http-equiv="Expires" content="0">
//     <title>jafdotdev</title>
//     <link rel="preconnect" href="https://rsms.me/">
//     <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
//     <script type="importmap">${JSON.stringify({})}</script>
//     <script type="module">import "index.js";</script>
//     </head>
//    <body></body>
//    </html>`;

//     res.setHeader('Content-Type', 'text/html; charset=utf-8');
//     res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//     res.setHeader('Pragma', 'no-cache');
//     res.setHeader('Expires', '0');
//     res.send(html);
// }

// app.get(
//     /^(?!\/jafdotdev-toolbar-app).*$/,
//     createHTMLToolbar,
// );

const getImportMap = () => {
    return {
        imports: {
            "react": "https://esm.sh/react",
            "react-dom": "https://esm.sh/react-dom",
        },
    }
}

// Set up basic middleware and static routes
const toolbarPath = Bun.env.NODE_ENV === 'production'
    ? resolve(_dirname, '../toolbar/dist')
    : resolve(_dirname, '../toolbar/dist');

app.use('/toolbar', express.static(resolve(__dirname, 'toolbar')));
// app.get(
//     '/jafdotdev-toolbar-app/config.js',
//     createHTMLToolbar,
// );

app.get('/{*splat}', (req: Request, res: Response) => {
    // Read the toolbar HTML
    const toolbarHtml = readFileSync(
      resolve(__dirname, 'toolbar/index.html'),
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
        
        
        // Handle different message types
        switch (data.type) {
          case 'chat_message':
            try {
              const response = await createAgent(data.content ?? "Edit the file in the web folder edit the page.tsx and make a simple ui for this website ");
              ws.send(JSON.stringify({ type: 'agent_message', content: response }));
            } catch (err) {
              console.error('Agent error:', err);
              ws.send(JSON.stringify({ type: 'agent_message', content: 'Sorry, something went wrong running the agent.' }));
            }
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