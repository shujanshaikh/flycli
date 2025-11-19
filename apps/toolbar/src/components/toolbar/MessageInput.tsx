import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { FileMention } from '@/components/file-mention';
import { ArrowUp, SquareIcon } from 'lucide-react';
import type { RefObject } from 'react';
import type { ChatStatus } from 'ai';

interface MessageInputProps {
  text: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  cursorPosition: number;
  showMentionPopover: boolean;
  mentionPopoverRef: RefObject<HTMLDivElement | null>;
  status: ChatStatus;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCursorPositionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFileSelect: (file: string) => void;
  onCloseMention: () => void;
  onSubmit: (message: PromptInputMessage) => void;
  onStop: () => void;
}

export function MessageInput({
  text,
  textareaRef,
  cursorPosition,
  showMentionPopover,
  mentionPopoverRef,
  status,
  onTextChange,
  onCursorPositionChange,
  onFileSelect,
  onCloseMention,
  onSubmit,
  onStop,
}: MessageInputProps) {
  return (
    <div className="px-4 pb-4 pt-2">
      <PromptInput
        onSubmit={onSubmit}
        globalDrop
        multiple
        inputGroupClassName="bg-zinc-800/50 backdrop-blur-sm supports-[backdrop-filter]:backdrop-blur-sm border border-white/5 shadow-sm transition-all hover:border-white/10 focus-within:border-pink-500/20 focus-within:ring-1 focus-within:ring-pink-500/10 rounded-[1.5rem]"
      >
        <PromptInputBody>
          <PromptInputTextarea
            onChange={onTextChange}
            onSelect={onCursorPositionChange}
            ref={textareaRef}
            value={text}
            placeholder="Ask flycli anything..."
            className="min-h-10 max-h-32 py-3 pl-5 pr-12 text-foreground placeholder:text-zinc-500 caret-pink-400 selection:bg-pink-500/20 bg-transparent"
          />
          {showMentionPopover && textareaRef.current && (
            <div
              ref={mentionPopoverRef}
              className="absolute z-50"
              style={{
                bottom: '100%',
                left: '0',
                marginBottom: '4px',
              }}
            >
              <FileMention
                text={text}
                cursorPosition={cursorPosition}
                onFileSelect={onFileSelect}
                onClose={onCloseMention}
              />
            </div>
          )}
        </PromptInputBody>
        <PromptInputFooter className="py-1.5 px-2">
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
          <PromptInputSubmit
            size="icon-sm"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            disabled={!text && status !== 'streaming'}
            status={status}
            aria-label="Send message"
          >
            {status === 'streaming' ? (
              <SquareIcon onClick={onStop} className="size-4" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </PromptInputSubmit>
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}

