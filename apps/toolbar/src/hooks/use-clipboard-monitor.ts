import { useEffect, useRef } from 'react';

export interface ClipboardChangeEvent {
  text: string;
  x: number;
  y: number;
}

export function useClipboardMonitor(onClipboardChange: (event: ClipboardChangeEvent) => void) {
  const lastPastedRef = useRef<string>('');
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastClickPositionRef = useRef<{ x: number; y: number; timestamp: number } | null>(null);

  useEffect(() => {
    // Track mouse position globally
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    // Capture click position exactly when clicked
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Ignore clicks on the toolbar or popover
      if (
        target.closest("[data-slot='popover-content']") ||
        target.closest("[data-slot='toolbar-container']")
      ) {
        return;
      }
      lastClickPositionRef.current = {
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true);

    const autoCopy = async () => {
      if (!document.hasFocus()) {
        return;
      }

      try {
        const text = await navigator.clipboard.readText();
        const hasComponentTrace = /\s+in\s+\w+\s*\(at\s+[^)]+\)/m.test(text);
        const hasJSXStructure = /<div[^>]*class\s*=/i.test(text) || /<[a-z][a-z0-9]*[^>]*>/i.test(text);

        // Must have both JSX structure and component trace to match the new format
        if (hasComponentTrace && hasJSXStructure && text !== lastPastedRef.current) {
          // Use the click position if it was clicked within the last 5 seconds
          const now = Date.now();
          const recentClick = lastClickPositionRef.current &&
            (now - lastClickPositionRef.current.timestamp) < 5000
            ? lastClickPositionRef.current
            : null;

          const position = recentClick
            ? { x: recentClick.x, y: recentClick.y }
            : mousePositionRef.current;

          onClipboardChange({
            text,
            x: position.x,
            y: position.y,
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
      document.removeEventListener('click', handleClick, true);
    };
  }, [onClipboardChange]);
}

