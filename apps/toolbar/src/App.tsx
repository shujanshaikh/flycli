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
import { WebsocketChatTransport } from '@repo/agent/ws-transport';
import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { ArrowUp, SquareIcon, MessageCircleDashed, Rabbit, Terminal } from 'lucide-react';
import { Reasoning, ReasoningContent, ReasoningTrigger } from './components/ai-elements/reasoning';
import { Shimmer } from './components/ai-elements/shimmer';
import type { ChatMessage } from '@/lib/types';
import { FileMention } from './components/file-mention';
import { chatModel } from './lib/models';
import { WS_URL } from './lib/constant';
import { TerminalComponent } from './components/Terminal';


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
  const [model, setModel] = useState<string>(chatModel[0].id);
  const [isTerminalEnabled, setIsTerminalEnabled] = useState(false);



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
    url: WS_URL,
  });

  const { messages, sendMessage, status , stop } = useChat<ChatMessage>({
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
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800/50">
        <iframe
          src="http://localhost:3000"
          className="absolute inset-0 w-full h-full border-0 bg-zinc-950"
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
            width: isCollapsed ? '52px' : '440px',
            height: isCollapsed ? '52px' : '600px',
            maxHeight: isCollapsed ? '52px' : '600px',
            zIndex: 1000,
            cursor: isDragging ? 'grabbing' : 'default'
          }}
        >
          <div className="flex flex-col h-full max-h-full bg-zinc-900/80 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl rounded-2xl border border-border/40 shadow-2xl overflow-hidden ring-1 ring-white/5">
            {isCollapsed ? (
              <div
                onMouseDown={handleMouseDown}
                className="flex items-center justify-center w-full h-full cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors rounded-2xl"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCollapsed(false);
                  }}
                  className="flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <MessageCircleDashed className="w-5 h-5 text-pink-400/90" />
                </button>
              </div>
            ) : (
              <>
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing border-b border-border/30"
                  onMouseDown={handleMouseDown}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 text-pink-400/90 text-xs font-medium tracking-wide">
                      <Rabbit className="size-3.5" />
                      flycli
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ModelSelector
                      model={model}
                      setModel={setModel}
                      container={toolbarRef.current}
                      size="sm"
                      className="text-zinc-400 hover:text-zinc-200 transition-colors"
                    />
                    <button
                      onClick={() => setIsCollapsed(true)}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-md hover:bg-white/5"
                    >
                      <MessageCircleDashed className="size-4" />
                    </button>
                  </div>
                </div>

                <div
                  className="flex flex-col flex-1 min-h-0 overflow-hidden cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                >
                  <Conversation className="flex-1 min-h-0">
                    <ConversationContent className="px-4 py-3">
                      {messages.map((message) => (
                        <Message from={message.role} key={message.id}>
                          <MessageContent
                            className="rounded-lg bg-transparent transition-colors
                          group-[.is-user]:rounded-lg group-[.is-user]:bg-zinc-800/50 group-[.is-user]:text-foreground group-[.is-user]:border group-[.is-user]:border-white/5
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
                                      isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                                    >
                                      <ReasoningTrigger />
                                      <ReasoningContent>{part.text}</ReasoningContent>
                                    </Reasoning>
                                  );
                                default: {
                                  if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const toolPart = part as any;
                                    return (
                                      <ToolRenderer
                                        key={`${message.id}-${i}`}
                                        toolType={toolPart.type}
                                        state={toolPart.state as 'input-streaming' | 'input-available' | 'output-available' | 'output-error'}
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
                        <div className="px-2 py-1">
                          <Shimmer className='text-sm text-zinc-400' duration={1}>flycli is thinking...</Shimmer>
                        </div>
                      )}
                    </ConversationContent>
                    <ConversationScrollButton />
                  </Conversation>


                  <div className="px-4 pb-4 pt-2">
                    <PromptInput
                      onSubmit={handleSubmit}
                      globalDrop
                      multiple
                      inputGroupClassName="bg-white/5 backdrop-blur-sm supports-[backdrop-filter]:backdrop-blur-sm border border-white/10 shadow-lg transition-all hover:border-white/20 focus-within:border-pink-500/30 focus-within:ring-1 focus-within:ring-pink-500/20"
                    >
                      <PromptInputBody>
                        <PromptInputTextarea
                          onChange={handleTextChange}
                          onSelect={handleCursorPositionChange}
                          ref={textareaRef}
                          value={text}
                          rows={1}
                          placeholder="Ask flycli anything..."
                          className="min-h-10 max-h-32 py-3 pl-4 pr-10 text-foreground placeholder:text-zinc-500 caret-pink-400 selection:bg-pink-500/20 bg-transparent"
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
                              onFileSelect={handleFileSelect}
                              onClose={() => setShowMentionPopover(false)}
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
                          className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-lg text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          disabled={!text && !loading}
                          status={status}
                          
                          aria-label="Send message"
                        >
                          {status === 'streaming' ? <SquareIcon  onClick={stop} className="size-4" />  : <ArrowUp className="size-4" />}
                        </PromptInputSubmit>
                      </PromptInputFooter>
                    </PromptInput>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 px-4 py-2.5 border-t border-border/30 bg-white/5">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-zinc-400">⌘</kbd>
                    <span className="text-zinc-600">+</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-zinc-400">K</kbd>
                  </div>
                  <div className="w-px h-3 bg-border/50" />
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                    <span className="text-zinc-400">@</span>
                    <span className="text-zinc-500">Add Context</span>
                  </div>
                  <div className="w-px h-3 bg-border/50" />
                  <button
                    onClick={() => setIsTerminalEnabled(!isTerminalEnabled)}
                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors ${
                      isTerminalEnabled
                        ? 'text-pink-400 bg-pink-500/10'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                    }`}
                    title={isTerminalEnabled ? 'Disable Terminal' : 'Enable Terminal'}
                  >
                    <Terminal className="size-3.5" />
                    <span>Terminal</span>
                  </button>
                </div>
                {isTerminalEnabled && (
                  <div className="border-t border-border/30 h-64 overflow-hidden">
                    <TerminalComponent enabled={isTerminalEnabled} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;