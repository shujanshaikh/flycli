import { useEffect, useRef } from 'react';

export interface ClipboardChangeEvent {
  text: string;
  x: number;
  y: number;
}

export function useClipboardMonitor(onClipboardChange: (event: ClipboardChangeEvent) => void) {
  const lastPastedRef = useRef<string>('');
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    // Track mouse position globally
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const autoCopy = async () => {
      if (!document.hasFocus()) {
        return;
      }

      try {
        const text = await navigator.clipboard.readText();
        if (text.includes('<selected_element>') && text !== lastPastedRef.current) {
          onClipboardChange({
            text,
            x: mousePositionRef.current.x,
            y: mousePositionRef.current.y,
          });
          lastPastedRef.current = text;
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'NotAllowedError') {
          console.error('Clipboard access error:', error);
        }
      }
    };

    const interval = setInterval(autoCopy, 1000);

    const handleFocus = () => {
      autoCopy();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [onClipboardChange]);
}

