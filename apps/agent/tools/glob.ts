import { tool } from "ai";
import { z } from "zod";
import { glob } from "node:fs/promises";

export const globTool = tool({
    description: "Use this tool to find files matching a glob pattern in a given path",
    inputSchema: z.object({
        pattern: z.string().describe('Glob pattern (e.g., "**/*.js")'),
        path: z.string().optional().describe('Relative directory path to search in'),
    }),
    execute: async ({ pattern, path }) => {


        if (!pattern) {
            return {
                success: false,
                message: 'Missing required parameter: pattern',
                error: 'MISSING_PATTERN',
            };
        }

        try {
            const searchPath = path ? undefined : process.cwd();

            const files = glob(pattern, {
                cwd: searchPath,

            })

            // Format the success message
            const searchLocation = path ? ` in "${path}"` : ' in current directory';
            const message = `Found ${files || 0} matches for pattern "${pattern}"${searchLocation}`;

            return {
                success: true,
                message: message,
                files: files,
            }



        } catch (error) {

            return {
                success: false,
                message: `Failed to find files matching pattern: ${pattern}`,
                error: 'GLOB_ERROR',
            };

        }
    }
})