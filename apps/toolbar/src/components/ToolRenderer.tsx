import { FileText, FolderTree, Search, Edit, Trash2, CheckCircle, Loader2, Files } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ToolOutput, ListFileItem } from '@/lib/types';



interface ToolRendererProps {

  toolType: string;

  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';

  output?: ToolOutput;

  errorText?: string;

}



const getToolIcon = (toolType: string): LucideIcon => {

  const iconMap: Record<string, LucideIcon> = {

    'tool-readFile': FileText,

    'tool-list': FolderTree,

    'tool-globTool': Files,

    'tool-grepTool': Search,

    'tool-searchReplace': Edit,

    'tool-editFiles': Edit,

    'tool-deleteFile': Trash2,

  };

  return iconMap[toolType] || FileText;

};



const getToolName = (toolType: string) => {

  const nameMap: Record<string, string> = {

    'tool-readFile': 'Read File',

    'tool-list': 'List Directory',

    'tool-globTool': 'Find Files',

    'tool-grepTool': 'Search Code',

    'tool-searchReplace': 'Replace Text',

    'tool-editFiles': 'Edit Files',

    'tool-deleteFile': 'Delete File',

  };

  return nameMap[toolType] || toolType.replace('tool-', '');

};



const getStatusIndicator = (state: ToolRendererProps['state']) => {

  if (state === 'output-available') return <span className="inline-block w-2 h-2 rounded-full bg-pink-500" />;

  if (state === 'output-error') return <span className="inline-block w-2 h-2 rounded-full bg-red-500" />;

  return <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" />;

};



export const ToolRenderer = ({ toolType, state, output, errorText }: ToolRendererProps) => {

  const Icon = getToolIcon(toolType);

  const toolName = getToolName(toolType);

  const isSuccess = state === 'output-available' && !errorText;

  const isError = state === 'output-error' || errorText;



  return (

    <div className={cn(

      "my-2 rounded-xl border transition-all bg-background/50",

      isSuccess && "border-pink-700/40",

      isError && "border-red-600/40",

      !isSuccess && !isError && "border-border/60"

    )}>

      {/* Header */}

      <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">

        <div className="flex items-center gap-2">

          <Icon className="w-4 h-4 text-muted-foreground" />

          <span className="text-xs font-medium text-pink-300">{toolName}</span>

        </div>

        {getStatusIndicator(state)}

      </div>



      {/* Content */}

      {(output || errorText) && (

        <div className="px-3 py-2">

          {errorText ? (

            <div className="text-xs text-red-400">{errorText}</div>

          ) : output ? (

            <ToolOutput toolType={toolType} output={output} />

          ) : null}

        </div>

      )}

    </div>

  );

};



const ToolOutput = ({ toolType, output }: { toolType: string; output: ToolOutput }) => {

  if (!output) return null;



  // Handle message-based output

  if ('message' in output && output.message) {

    return (

      <div className="space-y-2">

        <p className="text-xs text-muted-foreground">{output.message}</p>

        {renderToolSpecificOutput(toolType, output)}

      </div>

    );

  }



  // Fallback to JSON

  return (

    <pre className="text-xs text-muted-foreground overflow-x-auto">

      {JSON.stringify(output, null, 2)}

    </pre>

  );

};



const renderToolSpecificOutput = (toolType: string, output: ToolOutput) => {

  switch (toolType) {

    case 'tool-readFile': {
      const readFileOutput = output as Extract<ToolOutput, { content?: string }>;
      return readFileOutput.content ? (

        <div className="mt-2 rounded border border-border/30 bg-background/50 p-2 max-h-48 overflow-auto">

          <pre className="text-[10px] leading-relaxed text-foreground/80 font-mono whitespace-pre-wrap">

            {readFileOutput.content.length > 1000

              ? `${readFileOutput.content.substring(0, 1000)}...`

              : readFileOutput.content}

          </pre>

        </div>

      ) : null;
    }



    case 'tool-list': {
      const listOutput = output as Extract<ToolOutput, { files?: ListFileItem[] }>;
      return listOutput.files && listOutput.files.length > 0 ? (

        <div className="mt-2 space-y-0.5">

          {listOutput.files.slice(0, 10).map((file: ListFileItem, idx: number) => (

            <div key={idx} className="flex items-center gap-2 text-[10px] text-foreground/70">

              {file.type === 'directory' ? (

                <FolderTree className="w-3 h-3 text-pink-400 flex-shrink-0" />

              ) : (

                <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />

              )}

              <span className="font-mono truncate">{file.relativePath || file.name}</span>

            </div>

          ))}

          {listOutput.files.length > 10 && (

            <p className="text-[10px] text-muted-foreground mt-1">

              ... and {listOutput.files.length - 10} more

            </p>

          )}

        </div>

      ) : null;
    }



    case 'tool-globTool': {
      const globOutput = output as Extract<ToolOutput, { files?: string[] | Array<{ path?: string; name?: string }> }>;
      return globOutput.files && Array.isArray(globOutput.files) ? (

        <div className="mt-2 space-y-0.5">

          {globOutput.files.slice(0, 10).map((file: string | { path?: string; name?: string }, idx: number) => (

            <div key={idx} className="text-[10px] font-mono text-foreground/70 truncate">

              {typeof file === 'string' ? file : file.path || file.name}

            </div>

          ))}

          {globOutput.files.length > 10 && (

            <p className="text-[10px] text-muted-foreground mt-1">

              ... and {globOutput.files.length - 10} more

            </p>

          )}

        </div>

      ) : null;
    }



    case 'tool-grepTool': {
      const grepOutput = output as Extract<ToolOutput, { result?: { matches: string[] } }>;
      return grepOutput.result?.matches ? (

        <div className="mt-2 rounded border border-border/30 bg-background/50 p-2 max-h-48 overflow-auto">

          <div className="space-y-1">

            {grepOutput.result.matches.slice(0, 15).map((match: string, idx: number) => (

              <div key={idx} className="text-[10px] font-mono text-foreground/80 leading-relaxed">

                {match}

              </div>

            ))}

            {grepOutput.result.matches.length > 15 && (

              <p className="text-[10px] text-muted-foreground mt-1">

                ... and {grepOutput.result.matches.length - 15} more matches

              </p>

            )}

          </div>

        </div>

      ) : null;
    }



    case 'tool-searchReplace':
    case 'tool-editFiles': {
      const successOutput = output as Extract<ToolOutput, { success?: boolean }>;
      return successOutput.success ? (

        <div className="mt-2 flex items-center gap-1.5 text-pink-400">

          <CheckCircle className="w-3 h-3" />

          <span className="text-[10px]">Changes applied successfully</span>

        </div>

      ) : null;
    }



    case 'tool-deleteFile': {
      const deleteOutput = output as Extract<ToolOutput, { success?: boolean }>;
      return deleteOutput.success ? (

        <div className="mt-2 flex items-center gap-1.5 text-pink-400">

          <Trash2 className="w-3 h-3" />

          <span className="text-[10px]">File deleted successfully</span>

        </div>

      ) : null;
    }



    default:

      return null;

  }

};
