import { useEffect, useRef } from 'react';

export function useClipboardMonitor(onClipboardChange: (text: string) => void) {
  const lastPastedRef = useRef<string>('');

  useEffect(() => {
    const autoCopy = async () => {
      if (!document.hasFocus()) {
        return;
      }

      try {
        const text = await navigator.clipboard.readText();
        if (text.includes('<selected_element>') && text !== lastPastedRef.current) {
          onClipboardChange(text);
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
    };
  }, [onClipboardChange]);
}

