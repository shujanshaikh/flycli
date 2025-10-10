import { WebSocketServer } from "ws"

export async function createWsServer() {
    const wss = new WebSocketServer({
        noServer : true
    })
   
    return wss;

}