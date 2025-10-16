import { tool } from "ai";
import { z } from "zod";
import { readdir } from "node:fs/promises";
import path from "node:path";


export const readFile = tool({
  description:
    "Read the contents of a file. For text files, the output will be the 1-indexed file contents from start_line_one_indexed to end_line_one_indexed_inclusive.",
  inputSchema: z.object({
    relative_file_path: z
      .string()
      .describe("The relative path to the file to read."),
    should_read_entire_file: z
      .boolean()
      .describe("Whether to read the entire file."),
    start_line_one_indexed: z
      .number()
      .optional()
      .describe(
        "The one-indexed line number to start reading from (inclusive).",
      ),
    end_line_one_indexed: z
      .number()
      .optional()
      .describe("The one-indexed line number to end reading at (inclusive)."),
  }),
  execute: async ({
    relative_file_path,
    should_read_entire_file,
    start_line_one_indexed,
    end_line_one_indexed,
  }) => {

    try {
      if (!relative_file_path) {
        return {
          success: false,
          message: 'Missing required parameter: target_file',
          error: 'MISSING_TARGET_FILE',
        };
      }

      if (!start_line_one_indexed) {
        if (
          !Number.isInteger(start_line_one_indexed!) ||
          start_line_one_indexed! < 1
        ) {
          return {
            success: false,
            message:
              'start_line_one_indexed must be a positive integer (1-indexed)',
            error: 'INVALID_START_LINE',
          };
        }
        if (
          !Number.isInteger(end_line_one_indexed!) ||
          end_line_one_indexed! < 1
        ) {
          return {
            success: false,
            message:
              'end_line_one_indexed must be a positive integer (1-indexed)',
            error: 'INVALID_END_LINE',
          };
        }

        if (end_line_one_indexed! < start_line_one_indexed!) {
          return {
            success: false,
            message:
              'end_line_one_indexed must be greater than or equal to start_line_one_indexed',
            error: 'INVALID_LINE_RANGE',
          };
        }


      }
     try {
        const absolute_file_path = path.resolve(relative_file_path)
        if (!absolute_file_path) {
          return {
            success: false,
            message: 'Invalid file path',
            error: 'INVALID_FILE_PATH',
          };
        }

        const readOptions = should_read_entire_file ?
          undefined : {
            start_line: start_line_one_indexed,
            end_line: end_line_one_indexed,
          }

        const readResult = await readdir(absolute_file_path, {
          encoding: "utf-8",
          recursive: true,
          ...readOptions,
        })
       
       
        if (!readResult) {
          return {
            success: false,
            message: `Failed to read file: ${relative_file_path}`,
            error: 'READ_ERROR',
          };
        }

        const content = readResult.join('\n');
        const totalLines = readResult.length || content?.split('\n').length;


        let message: string;
        if (should_read_entire_file) {
          message = `Successfully read entire file: ${relative_file_path} (${totalLines} lines)`;
        } else {
          const linesRead = content?.split('\n').length || 0;
          message = `Successfully read lines ${start_line_one_indexed}-${end_line_one_indexed} from file: ${relative_file_path} (${linesRead} lines of ${totalLines} total)`;
        }

        return {
          success: true,
          message: message,
          content: content,
          totalLines: totalLines,
        };

      } catch (error) {
        return {
          success: false,
          message: `Failed to read file: ${relative_file_path}`,
          error: 'READ_ERROR',
        };
      }

    } catch (error) {
      return {
        success: false,
        message: `Failed to read file: ${relative_file_path}`,
        error: 'READ_ERROR',
      };
    }
  },
});
