import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import { ToolRenderer } from '@/components/ToolRenderer';
import { WebsocketChatTransport } from '../../agent/ws-transport';
import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { ChevronDown, ChevronUp, ArrowUp, SquareIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reasoning, ReasoningContent, ReasoningTrigger } from './components/ai-elements/reasoning';
import { Shimmer } from './components/ai-elements/shimmer';
import type { ChatMessage } from '@/lib/types';

const Chat = () => {
  const [text, setText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleToolCall = useCallback((result: any) => { console.log('result', result); }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent dragging if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const transport = new WebsocketChatTransport({
    agent: 'agent',
    toolCallCallback: handleToolCall,
    url: 'http://localhost:3100/agent',
  });

  const { messages, sendMessage, status  } = useChat<ChatMessage>({
    onFinish: () => setLoading(false),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    transport,
  });
  //console.log('messages', messages);
  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files
      },
    );
    setText('');
  };

  return (
    <div className="dark">
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-background">
        <iframe
          src="http://localhost:3000"
          className="absolute inset-0 w-full h-full border-0 bg-background"
          style={{
            zIndex: 0
          }}
        />

        <div
          ref={toolbarRef}
          className="fixed pointer-events-auto"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: '420px',
            height: '520px',
            zIndex: 1000,
            cursor: isDragging ? 'grabbing' : 'default'
          }}
        >
          <div className="flex flex-col bg-background/90 rounded-3xl border border-border/60 shadow-sm overflow-hidden">
            <div
              className="flex items-center justify-between px-3 py-1.5 bg-background/80 border-b border-border/60 cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 flycli-text text-pink-300 text-xs font-semibold tracking-wide">
                  flycli
                </span>
              </div>
              <div className="flex items-center gap-1 rounded-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col p-3 bg-background/60" style={{ height: '460px' }}>
                <Conversation>
                  <ConversationContent>
                    {messages.map((message) => (
                      <Message from={message.role} key={message.id}>
                        <MessageContent
                          className="rounded-2xl border border-border/60 bg-background/50 transition-colors
                          group-[.is-user]:rounded-3xl group-[.is-user]:bg-pink-700/30 group-[.is-user]:border-pink-700/40 group-[.is-user]:text-foreground
                          group-[.is-assistant]:bg-transparent group-[.is-assistant]:border-border/60 group-[.is-assistant]:text-foreground"
                        >
                          {message.parts.map((part, i) => {
                            switch (part.type) {
                              case 'text':
                                return (
                                  <Response key={`${message.id}-${i}`} className="leading-relaxed">
                                    {part.text}
                                  </Response>
                                );
                              case 'reasoning':
                                return (
                                  <Reasoning
                                    key={`${message.id}-${i}`}
                                    className="w-full"
                                    isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                                  >
                                    <ReasoningTrigger />
                                    <ReasoningContent>{part.text}</ReasoningContent>
                                  </Reasoning>
                                );
                              default: {
                                if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
                                  const toolPart = part as any;
                                  return (
                                    <ToolRenderer
                                      key={`${message.id}-${i}`}
                                      toolType={toolPart.type}
                                      state={toolPart.state}
                                      output={toolPart.output}
                                      errorText={toolPart.errorText}
                                    />
                                  );
                                }
                                return null;
                              }
                            }
                          })}
                        </MessageContent>
                      </Message>
                    ))}
                    
                   
                    {status === 'submitted' && (
                      <div className="px-2">
                       <Shimmer className='text-sm' duration={1}>flycli is thinking...</Shimmer>
                      </div>
                    )}
                  </ConversationContent>
                  <ConversationScrollButton />
                </Conversation>

                <PromptInput
                  onSubmit={handleSubmit}
                 // className="mt-2"
                  globalDrop
                  multiple
                  inputGroupClassName="rounded-full border border-border/50 bg-background/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md shadow-sm transition focus-within:ring-2 focus-within:ring-pink-500/40 focus-within:border-pink-500/40 focus-within:ring-offset-2 focus-within:ring-offset-background"
                >
                  <PromptInputBody>
                    {/* <PromptInputAttachments>
                    {(attachment) => <PromptInputAttachment data={attachment} />}
                  </PromptInputAttachments> */}
                    <PromptInputTextarea
                      onChange={(e) => setText(e.target.value)}
                      ref={textareaRef}
                      value={text}
                      rows={1}
                      placeholder='Ask me anything...'
                      className="min-h-10 max-h-32 py-3 pl-4 pr-10 rounded-full text-foreground placeholder:text-muted-foreground/80 caret-pink-400 selection:bg-pink-500/20"
                    />
                  </PromptInputBody>
                  <PromptInputFooter className="py-1">
                    <PromptInputTools>
                      <PromptInputActionMenu>
                        {/* <PromptInputActionMenuTrigger
                        size="icon-xs"
                        className="text-pink-300 hover:bg-pink-500/20 hover:text-pink-50"
                      /> */}
                        <PromptInputActionMenuContent>
                          <PromptInputActionAddAttachments />
                        </PromptInputActionMenuContent>
                      </PromptInputActionMenu>
                    </PromptInputTools>
                    <PromptInputSubmit
                      size="icon-sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full text-pink-500 hover:text-pink-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!text && !loading}
                      status={status}
                      aria-label="Send message"
                    >
                      {status === 'streaming' ? <SquareIcon className="size-5" /> : <ArrowUp className="size-5" />}
                    </PromptInputSubmit>
                  </PromptInputFooter>
                </PromptInput>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;