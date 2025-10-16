import { tool } from "ai";
import { z } from "zod"
import { exists, readdir, stat } from "node:fs/promises";
import path from "node:path";

export const list = tool({
  description: "Use this tool to list the file in the directory",
  inputSchema: z.object({
    path: z.string().optional(),
    recursive: z.boolean().optional().describe("Whether to list files recursively"), // Whether to list files recursively
    maxDepth: z.number().optional().describe("Maximum recursion depth (default: unlimited)")  , // Maximum recursion depth (default: unlimited)
    pattern: z.string().optional().describe("File extension (e.g., '.ts') or glob-like pattern"), // File extension (e.g., ".ts") or glob-like pattern
    includeDirectories: z.boolean().optional().describe("Whether to include directories in results (default: true)"), // Whether to include directories in results (default: true)
    includeFiles: z.boolean().optional().describe("Whether to include files in results (default: true)"), // Whether to include files in results (default: true)
  }),
  execute: async ({ path: relativePath, recursive, maxDepth, pattern, includeDirectories, includeFiles }) => {

    if (maxDepth !== undefined) {
      if (!Number.isInteger(maxDepth) || maxDepth < 0) {
        return {
          success: false,
          message: 'maxDepth must be a non-negative integer',
          error: 'INVALID_MAX_DEPTH',
        };
      }
    }

    if (!includeFiles && !includeDirectories) {
      return {
        success: false,
        message:
          'At least one of includeFiles or includeDirectories must be true',
        error: 'INVALID_INCLUDE_OPTIONS',
      };
    }
    try {
      const absolutePath = relativePath ? path.resolve(relativePath) : process.cwd();
      const fileExists = await exists(absolutePath);
      if (!fileExists) {
        return {
          success: false,
          message: `File does not exist: ${absolutePath}`,
          error: 'FILE_DOES_NOT_EXIST',
        };
      }

      const isDir = (await stat(absolutePath)).isDirectory();
      if (!isDir) {
        return {
          success: false,
          message: `File is not a directory: ${absolutePath}`,
          error: 'FILE_IS_NOT_A_DIRECTORY',
        };
      }

      const result = await readdir(absolutePath, {
        recursive: recursive || false,
        encoding: "buffer",
        withFileTypes: true,
      })

      if (!result) {
        return {
          success: false,
          message: `Failed to list files: ${absolutePath}`,
          error: 'LIST_ERROR',
        };
      }

      const totalFiles = result.filter(item => item.isFile()).length;
      const totalDirectories = result.filter(item => item.isDirectory()).length;

      let message = `Successfully listed ${result.length || 0} items in: ${relativePath}`;
      if (recursive) {
        message += ` (recursive${maxDepth !== undefined ? `, max depth ${maxDepth}` : ''})`;
      }
      if (pattern) {
        message += ` (filtered by pattern: ${pattern})`;
      }
      message += ` - ${totalFiles || 0} files, ${totalDirectories || 0} directories`;



      return {
        success: true,
        message: message,
        files: result,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to list files: ${error}`,
        error: 'LIST_ERROR',
      };
    }
  }
})


