import { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import type { ChatStatus } from 'ai';
import { useClipboardMonitor, type ClipboardChangeEvent } from '../hooks/use-clipboard-monitor';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ArrowUp, X } from 'lucide-react';

interface ElementCaptureNote {
  id: string;
  x: number;
  y: number;
  text: string;
}

interface ElementCaptureOverlayProps {
  onSendMessage: (messageText: string, model: string) => void;
  model: string;
  status: ChatStatus;
}

export function ElementCaptureOverlay({ onSendMessage, model, status }: ElementCaptureOverlayProps) {
  const [elementCaptureNote, setElementCaptureNote] = useState<ElementCaptureNote | null>(null);
  const [notePromptText, setNotePromptText] = useState<string>('');
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const clickPositionRef = useRef<{ x: number; y: number; timestamp: number } | null>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("[data-slot='popover-content']") ||
        target.closest("[data-slot='toolbar-container']")
      ) {
        return;
      }
      clickPositionRef.current = { 
        x: e.clientX, 
        y: e.clientY,
        timestamp: Date.now()
      };
    };

    document.addEventListener('mousedown', handleMouseDown, true);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, []);

  const handleElementCapture = (event: ClipboardChangeEvent) => {
    const now = Date.now();
    const recentClick = clickPositionRef.current && 
      (now - clickPositionRef.current.timestamp) < 5000 
      ? clickPositionRef.current 
      : null;
    
    const position = recentClick 
      ? { x: recentClick.x, y: recentClick.y }
      : { x: event.x, y: event.y };
    
    const captureNote: ElementCaptureNote = {
      id: nanoid(),
      x: position.x,
      y: position.y,
      text: event.text,
    };
    
    const popupWidth = 384;
    const popupHeight = 280;
    const padding = 4;
    const offset = 5;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x + offset;
    let y = position.y + offset;

    const wouldGoOffRight = x + popupWidth > viewportWidth - padding;
    const wouldGoOffBottom = y + popupHeight > viewportHeight - padding;

    if (wouldGoOffRight) {
      x = position.x - popupWidth - offset;
      if (x < padding) {
        x = position.x - popupWidth + 30;
        if (x < padding) {
          x = padding;
        }
      }
    }

    if (wouldGoOffBottom) {
      y = position.y - popupHeight - offset;
      if (y < padding) {
        y = position.y - popupHeight + 30;
        if (y < padding) {
          y = padding;
        }
      }
    }

    if (x < padding) x = padding;
    if (y < padding) y = padding;

    setElementCaptureNote(captureNote);
    setPopupPosition({ x, y });
    setNotePromptText('');
  };

  useClipboardMonitor(handleElementCapture);

  useEffect(() => {
    if (!elementCaptureNote) {
      setPopupPosition(null);
      return;
    }

    const handleResize = () => {
      const popupWidth = 384;
      const popupHeight = 280;
      const padding = 4;
      const offset = 5;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = elementCaptureNote.x + offset;
      let y = elementCaptureNote.y + offset;

      const wouldGoOffRight = x + popupWidth > viewportWidth - padding;
      const wouldGoOffBottom = y + popupHeight > viewportHeight - padding;

      if (wouldGoOffRight) {
        x = elementCaptureNote.x - popupWidth - offset;
        if (x < padding) {
          x = elementCaptureNote.x - popupWidth + 30;
          if (x < padding) {
            x = padding;
          }
        }
      }

      if (wouldGoOffBottom) {
        y = elementCaptureNote.y - popupHeight - offset;
        if (y < padding) {
          y = elementCaptureNote.y - popupHeight + 30;
          if (y < padding) {
            y = padding;
          }
        }
      }

      if (x < padding) x = padding;
      if (y < padding) y = padding;

      setPopupPosition({ x, y });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [elementCaptureNote]);

  function handleNotePromptSubmit() {
    if (!notePromptText.trim()) return;

    const messageText = elementCaptureNote
      ? `${notePromptText}\n\n${elementCaptureNote.text}`
      : notePromptText;

    onSendMessage(messageText, model);

    setNotePromptText('');
    setElementCaptureNote(null);
    clickPositionRef.current = null;
  }

  return (
    <div
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        if (
          !target.closest("[data-slot='popover-content']") &&
          !target.closest("[data-slot='toolbar-container']") &&
          !elementCaptureNote
        ) {
          e.currentTarget.style.pointerEvents = 'none';
          setTimeout(() => {
            e.currentTarget.style.pointerEvents = 'auto';
          }, 0);
        }
      }}
      className="fixed inset-0"
      style={{ zIndex: 100, pointerEvents: 'auto' }}
    >
      {elementCaptureNote && popupPosition && (
        <div
          key={elementCaptureNote.id}
          ref={popupRef}
          className="fixed w-96 transition-all duration-200 ease-out"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            zIndex: 150,
            pointerEvents: 'auto',
            opacity: 1,
          }}
        >
          <div className="p-3 bg-zinc-950/90 backdrop-blur-md border border-pink-500/20 rounded-2xl shadow-2xl shadow-pink-500/5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="mb-3 flex items-start gap-2 p-2.5 bg-zinc-900/50 border border-pink-500/10 rounded-xl text-xs text-zinc-400 group relative transition-colors hover:bg-zinc-900/80 hover:border-pink-500/20">
              <div className="flex-1 max-h-24 overflow-y-auto scrollbar-hide">
                <div className="font-mono whitespace-pre-wrap break-all leading-relaxed opacity-90">
                  {elementCaptureNote.text}
                </div>
              </div>
              <button
                onClick={() => {
                  setElementCaptureNote(null);
                  setNotePromptText('');
                  clickPositionRef.current = null;
                }}
                className="shrink-0 text-zinc-500 hover:text-pink-300 transition-colors p-0.5 rounded-full hover:bg-pink-500/10"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div className="relative flex items-center">
              <Input
                value={notePromptText}
                onChange={(e) => setNotePromptText(e.target.value)}
                placeholder="Ask about this element..."
                className="pr-10 h-11 bg-zinc-900/80 border-pink-500/10 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-pink-500/30 focus-visible:border-pink-500/30 rounded-2xl shadow-inner resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleNotePromptSubmit();
                  } else if (e.key === 'Escape') {
                    setElementCaptureNote(null);
                    setNotePromptText('');
                    clickPositionRef.current = null;
                  }
                }}
                autoFocus
              />
              <Button
                onClick={() => handleNotePromptSubmit()}
                disabled={!notePromptText.trim() || status === 'streaming'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 size-8 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-100 border-0 p-0 shadow-sm shadow-pink-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                size="icon"
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

