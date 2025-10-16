import { convertToModelMessages, generateId, readUIMessageStream, smoothStream, stepCountIs, streamText, type InferUIMessageChunk, type UIMessage } from "ai"
import { createWsServer } from "@repo/cli/cli"
import { WebSocketServer } from "ws"
import { editFiles } from "./tools/edit-files";

export class Agenet {
    private karton: WebSocketServer | null = null;
    private lastMessageId : string | null = null

   public async initlize() {
        this.karton = await createWsServer(); 
        if (!this.karton) {
            throw new Error("Failed to create ws server")
        }
        this.karton.on("connection", (ws) => {
            console.log("Connected to agent")
        })
        this.karton.on("error", (error) => {
            console.error("Error in ws server", error)
        })

        this.karton.on("close", () => {
            console.log("Ws server closed")
        })
    }


    public async callAgent({
        messages,
        model
    }: {

        messages: UIMessage[],
        model : string

    }) {
        const stream = streamText({
            messages: convertToModelMessages(messages),
            model: "",
            system: "",
            temperature: 0.1,
            stopWhen: stepCountIs(20),
            experimental_transform: smoothStream({
                delayInMs: 10,
                chunking: "line",
            }),
            maxRetries: 3,
            tools: {
                edit_file: editFiles
            },
            onFinish: () => {

            }
        });

        stream.consumeStream();
        const uiMessages = stream.toUIMessageStream({
            generateMessageId : generateId
        })
       
        await this.parseUiStream(uiMessages, (messageId) => {
            this.lastMessageId = messageId;
          });

    }

    private async parseUiStream(
        // Todo : Conver the UIMessage to own custom ChatMessage
        uiStream: ReadableStream<InferUIMessageChunk<UIMessage>>,
        onNewMessage?: (messageId: string) => void,
    ) {
        for await (const uiMessages of readUIMessageStream({
            stream : uiStream
        }))  {
            console.log(uiMessages)
            
        }
    }
}