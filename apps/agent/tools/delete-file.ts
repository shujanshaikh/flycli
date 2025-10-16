import { tool } from "ai";
import { z } from "zod";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";

export const deleteFile = tool({
    description: "Use this tool to delete a file",
    inputSchema: z.object({
        path: z.string().describe('Relative file path to delete'),
    }),
    execute: async ({ path: realPath }) => {

        if (!realPath) {
            return {
                success: false,
                message: 'Missing required parameter: path',
                error: 'MISSING_PATH',
            };
        }
        try {
            const absolute_file_path = path.resolve(realPath)
            if (!absolute_file_path) {
                return {
                    success: false,
                    message: 'Invalid file path',
                    error: 'INVALID_FILE_PATH',
                };
            }

            // Read the file content before deletion for undo capability
            const originalContent =
                await readFile(absolute_file_path);
            if (originalContent === undefined) {
                return {
                    success: false,
                    message: `Failed to read file before deletion: ${realPath}`,
                    error: 'READ_ERROR',
                };
            }

            const deleteResult = await unlink(absolute_file_path).catch((error) => {
                return {
                    success: false,
                    message: `Failed to read file before deletion: ${realPath}`,
                    error: 'DELETE_ERROR',
                };
            });
            if(!deleteResult?.success){
                return {
                    success: false,
                    message: `Failed to delete file before deletion: ${realPath}`,
                    error: 'DELETE_ERROR',
                };
            }

            return {
                success: true,
                message: `Successfully deleted file: ${realPath}`,
                content: originalContent,
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to delete file: ${realPath}`,
                error: 'DELETE_ERROR',
            };
        }

    }
})