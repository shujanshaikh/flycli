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
import { searchReplace } from "./tools/search-replace";
import {createOpenAI} from "@ai-sdk/openai";

export async function createAgent (message : WSMessage) {
  
  const openai = createOpenAI({
    apiKey: Bun.env.OPENAI_API_KEY,
    baseURL : "https://api.z.ai/api/coding/paas/v4",
  });
    try {
      const data = JSON.parse(message as string) as SendMessagesParams
      const model = (data.body as { model?: string } | undefined)?.model ?? "glm-4.6";
      const result = streamText({
       messages: convertToModelMessages(data.messages),
       model: openai.chat(model),
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
         searchReplace: searchReplace,
        },
        temperature : 0.7,
       // toolChoice: "required",
     });
    
    return result;
  } catch (error : any) {
    console.error('Error creating agent:', error);
    return error;
  }
}