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
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export async function createAgent (message : WSMessage) {
  const openrouter = createOpenRouter({
    apiKey: Bun.env.OPENROUTER_API_KEY,
  });
    try {
      const data = JSON.parse(message as string) as SendMessagesParams
      const result = streamText({
       messages: convertToModelMessages(data.messages),
       model: openrouter.chat("openai/gpt-5-mini"),
       stopWhen: stepCountIs(20), // Stop after 20 steps with tool calls
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
        toolChoice: "required",
     });
    return result;
  } catch (error : any) {
    console.error('Error creating agent:', error);
    return error;
  }
}