import { openrouter } from "@openrouter/ai-sdk-provider";
import { streamText , convertToModelMessages , stepCountIs , smoothStream} from "ai"
import { SYSTEM_PROMPT } from "./prompt";
import { editFiles } from "./tools/edit-files";
import { readFile } from "./tools/read-file";
import { list } from "./tools/ls";
import { globTool } from "./tools/glob";
import { deleteFile } from "./tools/delete-file";
import { grepTool } from "./tools/grep";
import type { WSMessage } from 'agents';
import type { SendMessagesParams } from "./ws-transport";

export async function createAgent (message : WSMessage , ws : WebSocket ) {
    try {
        const data = JSON.parse(message as string) as SendMessagesParams
      const result = streamText({
       messages: convertToModelMessages(data.messages),
       model: openrouter.chat("openai/gpt-5-nano"),
       stopWhen: stepCountIs(20), // Stop after 5 steps with tool calls
       system: SYSTEM_PROMPT,
       experimental_transform: smoothStream({
         delayInMs: 20,
         chunking: "word",
       }),
       tools: { 
         editFiles: editFiles,
         readFile: readFile,
         list: list,
         glob: globTool,
         deleteFile: deleteFile,
         grep: grepTool, 
        },
     });
 
     // Handle streaming text chunks using UIMessageStream
     for await (const chunk of result.toUIMessageStream()) {
       //console.log(chunk)
       ws.send(JSON.stringify(chunk));
     }
    } catch (error : any) {
        console.error('Error creating agent:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Error creating agent',
            error: error.message,
        }));
        ws.close();
        return error;
    }
}