import { tool } from "ai";
import { z } from "zod";
export const GREP_LIMITS = {
    DEFAULT_MAX_MATCHES: 200,
    MAX_TOTAL_OUTPUT_SIZE: 1 * 1024 * 1024, 
    TRUNCATION_MESSAGE:
      '\n[Results truncated due to size limits. Use more specific patterns or file filters to narrow your search.]',
  };


export const grepTool = tool({
  description: 'Fast, exact regex searches over text files using ripgrep',
  inputSchema: z.object({
    query: z.string().describe('The regex pattern to search for'),
    case_sensitive: z
      .boolean()
      .optional()
      .describe('Whether the search should be case sensitive'),
    include_file_pattern: z
      .string()
      .optional()
      .describe('Glob pattern for files to include (e.g., "*.ts")'),
    exclude_file_pattern: z
      .string()
      .optional()
      .describe('Glob pattern for files to exclude'),
    max_matches: z
      .number()
      .optional()
      .default(GREP_LIMITS.DEFAULT_MAX_MATCHES)
      .describe(
        `Maximum number of matches to return (default: ${GREP_LIMITS.DEFAULT_MAX_MATCHES}). Results may be truncated if this limit is exceeded.`,
      ),
    explanation: z
      .string()
      .describe('One sentence explanation of why this tool is being used'),
  }),
  execute: async ({ query, case_sensitive, include_file_pattern, exclude_file_pattern, max_matches, explanation }) => {
    if (!query) {
        return {
          success: false,
          message: 'Missing required parameter: query',
          error: 'MISSING_QUERY',
        };
      }
    
      if (!explanation) {
        return {
          success: false,
          message: 'Missing required parameter: explanation',
          error: 'MISSING_EXPLANATION',
        };
      }
    
      try {
        // Build ripgrep command arguments
        const args: string[] = [];
        
        // Add case sensitivity flag
        if (!case_sensitive) {
          args.push('-i');
        }
        
        // Add file pattern if specified
        if (include_file_pattern) {
          args.push('-g', include_file_pattern);
        }
        
        // Add exclude pattern if specified
        if (exclude_file_pattern) {
          args.push('-g', `!${exclude_file_pattern}`);
        }
        
        // Add max matches limit
        args.push('-m', max_matches.toString());
        
        // Add the search pattern
        args.push(query);
        
        // Search in current directory
        args.push('.');
        
        // Execute ripgrep using Bun
        const grepResult = await Bun.$`rg ${args}`.text();
        
        if (!grepResult) {
          return {
            success: false,
            message: 'Grep search returned no results',
            error: 'NO_RESULTS',
          };
        }
        
        // Split results into lines and count matches
        const lines = grepResult.split('\n').filter(line => line.trim() !== '');
        const matchCount = lines.length;
        
        // Check if results were truncated (we can't easily detect this with rg, so we'll estimate)
        const wasTruncated = matchCount >= max_matches;
        
        // Count unique files
        const files = new Set(lines.map(line => {
          const match = line.match(/^([^:]+):/);
          return match ? match[1] : '';
        }).filter(Boolean));
        
        // Format the success message
        let message = `Found ${matchCount} matches`;
        if (wasTruncated) {
          message = `Found ${max_matches}+ matches (showing first ${max_matches})`;
        }
        message += ` in ${files.size} files`;
        if (include_file_pattern) {
          message += ` (included: ${include_file_pattern})`;
        }
        if (exclude_file_pattern) {
          message += ` (excluded: ${exclude_file_pattern})`;
        }
        if (wasTruncated) {
          message += GREP_LIMITS.TRUNCATION_MESSAGE;
        }
        
        return {
          success: true,
          message,
          result: {
            matches: lines,
            totalMatches: matchCount,
            filesSearched: files.size,
            truncated: wasTruncated,
          },
        };
      } catch (error) {
        return {
          success: false,
          message: `Grep search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
  },
});


