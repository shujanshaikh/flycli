

import { Experimental_Agent as Agent, stepCountIs } from 'ai';
import { editFiles } from './tools/edit-files';
import { readFile } from './tools/read-file';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const systemPrompt = `
You are an expert TypeScript software engineer. There is already a Next.js project fully set up; do NOT create a new Next.js project or initialization steps. Your only tasks are to use the provided tools—readFile and editFiles—to make all required edits or additions directly within the existing Next.js project. Always use these tools to access and modify code as needed to fulfill the user's request. Only use the tools provided. Make sure to fully understand the instructions given and complete tasks by performing relevant reads and edits in the Next.js project using the appropriate tool.
`
export async function createAgent(prompt: string): Promise<string> {

    const openrouter = createOpenRouter({
        apiKey: Bun.env.OPENROUTER_API_KEY,
      });
      
    const model = openrouter.chat("openai/gpt-5")

  const codingAgent = new Agent({
    model: model,
    tools: {
      editFiles: editFiles,
      read_file: readFile,
    },
    system: systemPrompt,
    toolChoice: "required",
    stopWhen: stepCountIs(10),
  });

  const stream = codingAgent.stream({
    prompt,
  });

  let fullText = "";
  for await (const chunk of stream.textStream) {
    fullText += chunk;
  }
  return fullText;
}

