import { tool } from "ai";
import { z } from "zod"
import { writeFile } from "node:fs/promises"

const editFilesSchema = z.object({
  relative_file_path: z
    .string()
    .describe("The relative path to the file to modify. The tool will create any directories in the path that don't exist"),
  code_edit: z.string().describe("The content to write to the file"),
})

export const editFiles = tool({
  description: 'Use this tool to write or edit a file at the specified path.',
  inputSchema: editFilesSchema,
  execute: async (input) => {
    const { relative_file_path, code_edit } = input;
    try {
      const codes = await writeFile(relative_file_path, code_edit , {
        encoding : "utf-8",
      })
      return {
        success: true,
        message: `Successfully wrote to file: ${relative_file_path}`,
        codes: codes,
      };
    } catch (error : any) {
      return {
        success: false,
        message: error.message,
        error: 'WRITE_ERROR',
      };
      
    }
  },
})
