import { Shimmer } from '@/components/ai-elements/shimmer';
import type { ToolOutput } from '@/lib/types';

interface ToolRendererProps {
  toolType: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  output?: ToolOutput;
  errorText?: string;
}

const getStreamingText = (toolType: string): string => {
  const textMap: Record<string, string> = {
    'tool-readFile': 'Reading file',
    'tool-list': 'Listing directory',
    'tool-globTool': 'Finding files',
    'tool-grepTool': 'Searching code',
    'tool-searchReplace': 'Replacing text',
    'tool-editFiles': 'Editing files',
    'tool-deleteFile': 'Deleting file',
  };
  return textMap[toolType] || 'Processing';
};

const getCompletedText = (toolType: string): string => {
  const textMap: Record<string, string> = {
    'tool-readFile': 'Read file',
    'tool-list': 'Listed directory',
    'tool-globTool': 'Found files',
    'tool-grepTool': 'Searched code',
    'tool-searchReplace': 'Replaced text',
    'tool-editFiles': 'Edited files',
    'tool-deleteFile': 'Deleted file',
  };
  return textMap[toolType] || 'Completed';
};

const extractFileName = (message: string): string | null => {
  // Extract file name from messages like "Successfully read entire file: path/to/file.ts"
  const match = message.match(/file:\s*([^\s(]+)/i);
  if (match) {
    const filePath = match[1];
    return filePath.split('/').pop() || filePath;
  }
  return null;
};

export const ToolRenderer = ({ toolType, state, output, errorText }: ToolRendererProps) => {
  const isStreaming = state === 'input-streaming' || state === 'input-available';
  const isSuccess = state === 'output-available' && !errorText;
  const isError = state === 'output-error' || errorText;

  // For streaming state, show shimmer animation like "flycli is thinking..."
  if (isStreaming) {
    const streamingText = `${getStreamingText(toolType)}...`;
    return (
      <div className="my-2 px-2 py-1">
        <Shimmer className="text-xs text-muted-foreground" duration={1}>
          {streamingText}
        </Shimmer>
      </div>
    );
  }

  // For error states
  if (isError) {
    return (
      <div className="my-1">
        <span className="text-xs text-foreground/80 font-medium">{errorText || 'Error occurred'}</span>
      </div>
    );
  }

  // For readFile, show file name with elegant styling
  if (toolType === 'tool-readFile' && output && 'message' in output) {
    const fileName = extractFileName(output.message);
    
    return (
      <div className="my-1 inline-flex items-center gap-2 text-xs text-foreground/80">
        <span className="font-medium">
          Read file
        </span>
        {fileName && (
          <>
            <span className="text-muted-foreground font-mono">
              {fileName}
            </span>
          </>
        )}
      </div>
    );
  }

  if (toolType === 'tool-searchReplace' && output && 'message' in output) {
    const fileName = extractFileName(output.message);
    return (
      <div className="my-1 inline-flex items-center gap-2 text-xs text-foreground/80">
        <span className="font-medium">
          Replaced text
        </span>
      {fileName && (
        <>
          <span className="text-muted-foreground font-mono">
            {fileName}
          </span>
        </>
      )}
      </div>
    );
  }

  if (toolType === 'tool-grepTool' && output && 'message' in output) {
    return (
      <div className="my-1 inline-flex items-center gap-2 text-xs text-foreground/80">
        <span className="font-medium">
         grep: {output.message}
        </span> 
      </div>
    );
  }


  if (toolType === 'tool-list' && output && 'message' in output) {  
    return (
      <div className="my-1 inline-flex items-center gap-2 text-xs text-foreground/80">
        <span className="font-medium">
        list: {output.message}
        </span>
        
      </div>
    );
  }

  if (toolType === 'tool-globTool' && output && 'message' in output) {
    return (
      <div className="my-1 inline-flex items-center gap-2 text-xs text-foreground/80">
        <span className="font-medium">
          glob: {output.message}
        </span>
      </div>
    );
  }

  if (toolType === 'tool-deleteFile' && output && 'message' in output) {
    return (
      <div className="my-1 inline-flex items-center gap-2 text-xs text-foreground/80">
        <span className="font-medium">
          delete: {output.message}
        </span>
      </div>
    );
  }

  if (toolType === 'tool-editFiles' && output && 'message' in output) {
    return (
      <div className="my-1 inline-flex items-center gap-2 text-xs text-foreground/80">
        <span className="font-medium">
          edit: {output.message}
        </span>
      </div>
    );
  }

  // For other tools, show elegant success indicator with appropriate colors
  if (isSuccess) {
    return (
      <div className="my-1">
        <span className="text-xs text-foreground/80 font-medium">
          {getCompletedText(toolType)}
        </span>
      </div>
    );
  }

  return null;
};
