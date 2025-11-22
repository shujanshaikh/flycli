import type { ChatMessage } from '@/lib/types';
import { Shimmer } from './ai-elements/shimmer';

export const ToolRenderer = ({ part }: { part: ChatMessage['parts'][number] }) => {
  if (part.type === "tool-editFiles") {
    const { toolCallId, state } = part;

    if (state === "input-streaming") {
      return (
        <div key={toolCallId} className="px-3 py-1.5">
          <Shimmer className="text-sm text-zinc-400" duration={1}>
            {`editing ${part.input?.target_file ?? 'file'}`}
          </Shimmer>
        </div>
      );
    }
    if (state === "output-available") {
      const output = part.output as { success?: boolean; message?: string; linesAdded?: number; linesRemoved?: number; isNewFile?: boolean } | undefined;
      if (output?.isNewFile) {
        return (
          <div key={toolCallId} className="px-3 py-1.5">
            <span className="text-sm text-zinc-300">Created {part.input?.target_file || 'file'}</span>
            {output?.linesAdded ? ` (+${output.linesAdded})` : ''}
            {output?.linesRemoved ? ` (-${output.linesRemoved})` : ''}
          </div>
        );
      }
      return (
        <div key={toolCallId} className="px-3 py-1.5">
          <span className="text-sm text-zinc-300">
            Modified {part.input?.target_file || 'file'}
            {output?.linesAdded ? ` (+${output.linesAdded})` : ''}
            {output?.linesRemoved ? ` (-${output.linesRemoved})` : ''}
          </span>
        </div>
      );
    }
  }

  if (part.type === "tool-deleteFile") {
    const { toolCallId, state } = part;

    if (state === "input-streaming") {
      return (
        <div key={toolCallId} className="px-3 py-1.5">
          <Shimmer className="text-sm text-zinc-400" duration={1}>
            {`deleting ${part.input?.path ?? 'file'}`}
          </Shimmer>
        </div>
      );
    }
    if (state === "output-available") {
      return (
        <div key={toolCallId} className="px-3 py-1.5">
          <span className="text-sm text-zinc-300">Deleted {part.input?.path || 'file'}</span>
        </div>
      );
    }
  }

  if (part.type === "tool-readFile") {
    const { toolCallId, state } = part;

    if (state === "input-streaming") {
      return (
        <div key={toolCallId} className="px-3 py-1.5">
          <Shimmer className="text-sm text-zinc-400" duration={1}>
            {`reading ${part.input?.relative_file_path ?? 'file'}`}
          </Shimmer>
        </div>
      );
    }
    if (state === "output-available") {
      const output = part.output as { totalLines?: number } | undefined;
      return (
        <div key={toolCallId} className="px-3 py-1.5">
          <span className="text-sm text-zinc-300">
            Read {part.input?.relative_file_path || 'file'}
            {output?.totalLines ? ` (${output.totalLines} lines)` : ''}
          </span>
        </div>
      );
    }
  }

  if (part.type === "tool-list") {
    const { toolCallId, state } = part;

    if (state === "input-streaming") {
      return (
        <div key={toolCallId} className="px-3 py-1.5">
          <Shimmer className="text-sm text-zinc-400" duration={1}>
            {`listing ${part.input?.path ?? 'directory'}`}
          </Shimmer>
        </div>
      );
    }
    if (state === "output-available") {
      const output = part.output as { files?: Array<{ name: string; type: string }> } | undefined;
      const fileCount = output?.files?.filter(f => f.type === 'file').length || 0;
      const dirCount = output?.files?.filter(f => f.type === 'directory').length || 0;
      return (
        <div key={toolCallId} className="px-3 py-1.5">
          <span className="text-sm text-zinc-300">
            Listed {part.input?.path || 'directory'}
            {fileCount > 0 || dirCount > 0 ? ` (${fileCount} files${dirCount > 0 ? `, ${dirCount} dirs` : ''})` : ''}
          </span>
        </div>
      );
    }
  }

  if (part.type === "tool-globTool") {
    const { toolCallId, state } = part;

    if (state === "input-streaming") {
      return (
        <div key={toolCallId} className="px-3 py-1.5">
          <Shimmer className="text-sm text-zinc-400" duration={1}>
            {`globbing...`}
          </Shimmer>
        </div>
      );
    }
    if (state === "output-available") {
      const output = part.output as { files?: string[] | Array<{ path?: string; name?: string }> } | undefined;
      const fileCount = Array.isArray(output?.files) ? output.files.length : 0;
      return (
        <div key={toolCallId} className="px-3 py-1.5">
          <span className="text-sm text-zinc-300">Found {fileCount} file{fileCount !== 1 ? 's' : ''}</span>
        </div>
      );
    }
  }

  if (part.type === "tool-grepTool") {
    const { toolCallId, state } = part;

    if (state === "input-streaming") {
      return (
        <div key={toolCallId} className="px-3 py-1.5">
          <Shimmer className="text-sm text-zinc-400" duration={1}>
            {`grepping...`}
          </Shimmer>
        </div>
      );
    }
    if (state === "output-available") {
      const output = part.output as { matchCount?: number; result?: { totalMatches?: number } } | undefined;
      const matchCount = output?.matchCount || output?.result?.totalMatches || 0;
      return (
        <div key={toolCallId} className="px-3 py-1.5">
          <span className="text-sm text-zinc-300">Found {matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
        </div>
      );
    }
  }

  if (part.type === "tool-searchReplace") {
    const { toolCallId, state } = part;

    if (state === "input-streaming") {
      return (
        <div key={toolCallId} className="px-3 py-1.5">
          <Shimmer className="text-sm text-zinc-400" duration={1}>
            {`replacing in ${part.input?.file_path ?? 'file'}`}
          </Shimmer>
        </div>
      );
    } 
    if (state === "output-available") {
      const output = part.output as { linesAdded?: number; linesRemoved?: number } | undefined;
      return (
        <div key={toolCallId} className="px-3 py-1.5">
          <span className="text-sm text-zinc-300">Replaced in {part.input?.file_path || 'file'}</span>
          {output?.linesAdded ? ` (+${output.linesAdded})` : ''}
          {output?.linesRemoved ? ` (-${output.linesRemoved})` : ''}
        </div>
      );
    }
  }

  return null;
};
