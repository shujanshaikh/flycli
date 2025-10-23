import { tool } from "ai";
import { z } from "zod";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const searchReplace = tool({
    description : "Use this tool to propose a search and replace operation on an existing file.\n\nThe tool will replace ONE occurrence of old_string with new_string in the specified file.\n\nCRITICAL REQUIREMENTS FOR USING THIS TOOL:\n\n1. UNIQUENESS: The old_string MUST uniquely identify the specific instance you want to change. This means:\n   - Include AT LEAST 3-5 lines of context BEFORE the change point\n   - Include AT LEAST 3-5 lines of context AFTER the change point\n   - Include all whitespace, indentation, and surrounding code exactly as it appears in the file\n\n2. SINGLE INSTANCE: This tool can only change ONE instance at a time. If you need to change multiple instances:\n   - Make separate calls to this tool for each instance\n   - Each call must uniquely identify its specific instance using extensive context\n\n3. VERIFICATION: Before using this tool:\n   - If multiple instances exist, gather enough context to uniquely identify each one\n   - Plan separate tool calls for each instance\n",
    inputSchema : z.object({
        file_path : z.string().describe("The path to the file you want to search and replace in. You can use either a relative path in the workspace or an absolute path. If an absolute path is provided, it will be preserved as is"),
        new_string : z.string().describe("The edited text to replace the old_string (must be different from the old_string)"),
        old_string : z.string().describe("The text to replace (must be unique within the file, and must match the file contents exactly, including all whitespace and indentation)"),
    }),
    execute : async ({ file_path, new_string, old_string }) => {
        try {
            // Validate inputs
            if (!file_path) {
                return {
                    success: false,
                    message: 'Missing required parameter: file_path',
                    error: 'MISSING_FILE_PATH',
                };
            }

            if (old_string === undefined || old_string === null) {
                return {
                    success: false,
                    message: 'Missing required parameter: old_string',
                    error: 'MISSING_OLD_STRING',
                };
            }

            if (new_string === undefined || new_string === null) {
                return {
                    success: false,
                    message: 'Missing required parameter: new_string',
                    error: 'MISSING_NEW_STRING',
                };
            }

            if (old_string === new_string) {
                return {
                    success: false,
                    message: 'old_string and new_string must be different',
                    error: 'STRINGS_IDENTICAL',
                };
            }

            // Resolve the file path
            const absolute_file_path = path.resolve(file_path);

            // Read the file content
            let fileContent: string;
            try {
                fileContent = await readFile(absolute_file_path, 'utf-8');
            } catch (error: any) {
                if (error?.code === 'ENOENT') {
                    return {
                        success: false,
                        message: `File not found: ${file_path}`,
                        error: 'FILE_NOT_FOUND',
                    };
                }
                return {
                    success: false,
                    message: `Failed to read file: ${file_path}`,
                    error: 'READ_ERROR',
                };
            }

            // Check if old_string exists in the file
            if (!fileContent.includes(old_string)) {
                return {
                    success: false,
                    message: `old_string not found in file: ${file_path}`,
                    error: 'STRING_NOT_FOUND',
                };
            }

            // Count occurrences of old_string
            const occurrences = fileContent.split(old_string).length - 1;
            if (occurrences > 1) {
                return {
                    success: false,
                    message: `old_string appears ${occurrences} times in the file. It must be unique. Please include more context to make it unique.`,
                    error: 'STRING_NOT_UNIQUE',
                };
            }

            // Perform the replacement
            const newContent = fileContent.replace(old_string, new_string);

            // Write the modified content back to the file
            try {
                await writeFile(absolute_file_path, newContent, 'utf-8');
                return {
                    success: true,
                    message: `Successfully replaced string in file: ${file_path}`,
                };
            } catch (error: any) {
                return {
                    success: false,
                    message: `Failed to write to file: ${file_path}`,
                    error: 'WRITE_ERROR',
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: `Unexpected error: ${error.message}`,
                error: 'UNEXPECTED_ERROR',
            };
        }
    }
})