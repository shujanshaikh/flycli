import { useRef, useState } from 'react';
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { chatModel } from './lib/models';
import { useDragAndDrop } from './hooks/use-drag-and-drop';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { useMentions } from './hooks/use-mentions';
import { useChatTransport } from './hooks/use-chat-transport';
import { ToolbarContainer } from './components/toolbar/ToolbarContainer';
import { CollapsedToolbar } from './components/toolbar/CollapsedToolbar';
import { ToolbarHeader } from './components/toolbar/ToolbarHeader';
import { ConversationSection } from './components/toolbar/ConversationSection';
import { MessageInput } from './components/toolbar/MessageInput';
import { ToolbarFooter } from './components/toolbar/ToolbarFooter';
import { TerminalSection } from './components/toolbar/TerminalSection';
import { AppFrame } from './components/toolbar/AppFrame';
import { ElementCaptureOverlay } from './components/ElementCaptureOverlay';

const Chat = () => {
  const [text, setText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [model, setModel] = useState<string>(chatModel[0].id);
  const [isTerminalEnabled, setIsTerminalEnabled] = useState(false);

  const { position, isDragging, toolbarRef, handleMouseDown } = useDragAndDrop();
  const { messages, sendMessage, status, stop } = useChatTransport();

  useKeyboardShortcuts('cmd+k', () => setIsCollapsed(!isCollapsed), [isCollapsed]);

  const handleElementCaptureMessage = (messageText: string, modelId: string) => {
    sendMessage(
      {
        text: messageText,
      },
      {
        body: {
          model: modelId,
        },
      }
    );
  };
  const {
    cursorPosition,
    showMentionPopover,
    mentionPopoverRef,
    handleTextChange,
    handleCursorPositionChange,
    handleFileSelect: handleMentionFileSelect,
    setShowMentionPopover,
  } = useMentions(text, setText);

  const handleFileSelect = (file: string) => {
    handleMentionFileSelect(file, text, textareaRef);
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
      },
      {
        body: {
          model: model,
        },
      }
    );
    setText('');
  };

  return (
    <div className="dark">
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800/50">
        <AppFrame />
        <ElementCaptureOverlay
          onSendMessage={handleElementCaptureMessage}
          model={model}
          status={status}
        />
        <ToolbarContainer
          position={position}
          isDragging={isDragging}
          isCollapsed={isCollapsed}
          toolbarRef={toolbarRef}
        >
          {isCollapsed ? (
            <CollapsedToolbar
              onExpand={() => setIsCollapsed(false)}
              onMouseDown={handleMouseDown}
            />
          ) : (
            <>
              <ToolbarHeader
                model={model}
                setModel={setModel}
                onCollapse={() => setIsCollapsed(true)}
                onMouseDown={handleMouseDown}
                containerRef={toolbarRef}
              />

              <ConversationSection
                messages={messages}
                status={status}
                onMouseDown={handleMouseDown}
              />

              <MessageInput
                text={text}
                textareaRef={textareaRef}
                cursorPosition={cursorPosition}
                showMentionPopover={showMentionPopover}
                mentionPopoverRef={mentionPopoverRef}
                status={status}
                onTextChange={handleTextChange}
                onCursorPositionChange={handleCursorPositionChange}
                onFileSelect={handleFileSelect}
                onCloseMention={() => setShowMentionPopover(false)}
                onSubmit={handleSubmit}
                onStop={stop}
              />

              <ToolbarFooter
                isTerminalEnabled={isTerminalEnabled}
                onTerminalToggle={() => setIsTerminalEnabled(!isTerminalEnabled)}
              />

              <TerminalSection enabled={isTerminalEnabled} />
            </>
          )}
        </ToolbarContainer>
      </div >
    </div >
  );
};

export default Chat;