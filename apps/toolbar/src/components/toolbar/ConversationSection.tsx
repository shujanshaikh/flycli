import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import { ToolRenderer } from '@/components/ToolRenderer';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Shimmer } from '@/components/ai-elements/shimmer';
import type { ChatMessage } from '@/lib/types';
import type { ChatStatus } from 'ai';

interface ConversationSectionProps {
  messages: ChatMessage[];
  status: ChatStatus;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function ConversationSection({ messages, status, onMouseDown }: ConversationSectionProps) {
  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={onMouseDown}
    >
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className="px-4 py-3">
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent
                className="rounded-2xl bg-transparent transition-colors
                  group-[.is-user]:rounded-2xl group-[.is-user]:bg-zinc-800/30 group-[.is-user]:text-foreground
                  group-[.is-assistant]:bg-transparent group-[.is-assistant]:text-foreground"
              >
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <Response key={`${message.id}-${i}`} className="leading-relaxed text-sm">
                          {part.text}
                        </Response>
                      );
                    case 'reasoning':
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={
                            status === 'streaming' &&
                            i === message.parts.length - 1 &&
                            message.id === messages[messages.length - 1]?.id
                          }
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      return <ToolRenderer key={`${message.id}-${i}`} part={part} />;
                  }
                })}
              </MessageContent>
            </Message>
          ))}

          {status === 'submitted' && (
            <div className="px-2 py-1">
              <Shimmer className="text-sm text-zinc-400" duration={1}>
                flycli is thinking...
              </Shimmer>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}

