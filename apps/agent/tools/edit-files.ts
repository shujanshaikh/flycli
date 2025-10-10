import { tool } from "ai";
import { z } from "zod"


export const editFiles = tool({
  description: 'Use this tool to write or edit a file at the specified path.',
  inputSchema: z.object({
    relative_file_path: z
      .string()
      .describe(
        "The relative path to the file to modify. The tool will create any directories in the path that don't exist",
      ),
    code_edit: z.string().describe("The content to write to the file"),
  }),
  execute: async ({ relative_file_path, code_edit }) => {
    const codes = await Bun.write(relative_file_path, code_edit)
    console.log(relative_file_path)
    console.log(code_edit)
    return { codes };
  },
})
