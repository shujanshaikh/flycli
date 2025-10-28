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
import { ModelSelector } from '@/components/model-selector';
import { useEffect, useRef, useState } from 'react';
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
import { ArrowUp, SquareIcon, MessageCircleDashed, Rabbit } from 'lucide-react';
import { Reasoning, ReasoningContent, ReasoningTrigger } from './components/ai-elements/reasoning';
import { Shimmer } from './components/ai-elements/shimmer';
import type { ChatMessage } from '@/lib/types';
import { FileMention } from './components/file-mention';
import { models } from './lib/models';

const Chat = () => {



  const [text, setText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const mentionPopoverRef = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<string>(models[0].id);



  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent dragging if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('textarea') ||
      target.closest('input') ||
      target.closest('[role="textbox"]') ||
      target.closest('a')
    ) {
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

  // Add keyboard shortcut for cmd + k
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCollapsed(!isCollapsed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed]);

  const transport = new WebsocketChatTransport({
    agent: 'agent',
    toolCallCallback: () => { },
    url: 'http://localhost:3100/agent',
  });

  const { messages, sendMessage, status } = useChat<ChatMessage>({
    onFinish: () => setLoading(false),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    transport,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setCursorPosition(e.target.selectionStart);

    // Check if we should show mentions
    const textBeforeCursor = newText.slice(0, e.target.selectionStart);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    const lastCharBeforeCursor = textBeforeCursor[textBeforeCursor.length - 1];
    const isLastCharSpace = lastCharBeforeCursor === ' ' || lastCharBeforeCursor === '\n';

    if (atIndex !== -1 && !isLastCharSpace && textBeforeCursor.slice(atIndex + 1).indexOf(' ') === -1) {
      setShowMentionPopover(true);
    } else {
      setShowMentionPopover(false);
    }
  };

  const handleCursorPositionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.target.selectionStart);

    // Check if cursor is after an @ symbol
    const textBeforeCursor = e.target.value.slice(0, e.target.selectionStart);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    const lastCharBeforeCursor = textBeforeCursor[textBeforeCursor.length - 1];
    const isLastCharSpace = lastCharBeforeCursor === ' ' || lastCharBeforeCursor === '\n';

    if (atIndex !== -1 && !isLastCharSpace && textBeforeCursor.slice(atIndex + 1).indexOf(' ') === -1) {
      setShowMentionPopover(true);
    } else {
      setShowMentionPopover(false);
    }
  };

  const handleFileSelect = (file: string) => {
    const textBeforeCursor = text.slice(0, cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const textAfterCursor = text.slice(cursorPosition);
      const newText = text.slice(0, atIndex) + `@${file} ` + textAfterCursor;
      setText(newText);
      setShowMentionPopover(false);

      // Focus back on textarea and set cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = atIndex + file.length + 2;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const handleSubmit = (message: PromptInputMessage) => {
    setShowMentionPopover(false);
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files,
      }, {
      body: {
        model: model,
      }
    }
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
            width: isCollapsed ? '56px' : '420px',
            height: isCollapsed ? '56px' : '660px',
            zIndex: 1000,
            cursor: isDragging ? 'grabbing' : 'default'
          }}
        >
          <div className="flex flex-col bg-background/90 rounded-3xl border border-border/60 shadow-sm overflow-hidden">
            {isCollapsed ? (
              <div
                onMouseDown={handleMouseDown}
                className="flex items-center justify-center w-14 h-14 cursor-grab active:cursor-grabbing hover:bg-background/80 transition-colors"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCollapsed(false);
                  }}
                  className="flex items-center justify-center"
                >
                  <MessageCircleDashed className="w-6 h-6 text-pink-400" />
                </button>
              </div>
            ) : (
              <>
                {/* Top bar */}
                <div
                  className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800 cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                >
                  <div className="flex items-center gap-2 px-1">
                    <span className="flex items-center gap-1 px-2 py-0.5 text-pink-300 text-xs font-semibold tracking-wide">
                      <Rabbit className="size-4" />
                      flycli
                    </span>
                  </div>
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <MessageCircleDashed className="size-4" />
                  </button>
                </div>


                <div
                  className="flex flex-col p-3 bg-background/60 cursor-grab active:cursor-grabbing"
                  style={{ height: '488px' }}
                  onMouseDown={handleMouseDown}
                >
                  <div className="mb-2">
                    <div className="flex items-center justify-end gap-2 rounded-lg">
                      <ModelSelector
                        model={model}
                        setModel={setModel}
                        container={toolbarRef.current}
                        size="sm"
                        className="text-zinc-300 hover:text-zinc-100"
                      />
                    </div>
                  </div>
                  <Conversation>
                    <ConversationContent>
                      {messages.map((message) => (
                        <Message from={message.role} key={message.id}>
                          <MessageContent
                            className="rounded-xl bg-transparent transition-colors
                          group-[.is-user]:rounded-lg group-[.is-user]:bg-zinc-800 group-[.is-user]:text-foreground
                          group-[.is-assistant]:bg-transparent group-[.is-assistant]:text-foreground"
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
                    inputGroupClassName="bg-background/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md shadow-sm transition"
                  >
                    <PromptInputBody>
                      
                      {/* <PromptInputAttachments>
                    {(attachment) => <PromptInputAttachment data={attachment} />}
                  </PromptInputAttachments> */}
                      <PromptInputTextarea
                        onChange={handleTextChange}
                        onSelect={handleCursorPositionChange}
                        ref={textareaRef}
                        value={text}
                        rows={1}
                        // placeholder='Ask me anything...'
                        className="min-h-10 max-h-32 py-3 pl-4 pr-10 text-foreground placeholder:text-muted-foreground/80 caret-pink-400 selection:bg-pink-500/20"
                      />
                      {showMentionPopover && textareaRef.current && (
                        <div
                          ref={mentionPopoverRef}
                          className="absolute"
                          style={{
                            bottom: '100%',
                            left: '0',
                            marginBottom: '4px',
                          }}
                        >
                          <FileMention
                            text={text}
                            cursorPosition={cursorPosition}
                            onFileSelect={handleFileSelect}
                            onClose={() => setShowMentionPopover(false)}
                          />
                        </div>
                      )}
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


                <div
                  className="flex items-center justify-center gap-8 px-3 py-2 bg-zinc-900 border-t border-zinc-800"
                >
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <span className="text-zinc-300">⌘</span>
                    <span className="text-zinc-400">+</span>
                    <span className="text-zinc-300">K</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <span className="text-zinc-300">@ Add Context</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;