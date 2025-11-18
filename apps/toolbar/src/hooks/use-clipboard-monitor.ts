import { useEffect, useRef } from 'react';

export function useClipboardMonitor(onClipboardChange: (text: string) => void) {
  const lastPastedRef = useRef<string>('');

  useEffect(() => {
    const autoCopy = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text.includes('<selected_element>') && text !== lastPastedRef.current) {
          onClipboardChange(text);
          lastPastedRef.current = text;
        }
      } catch (error) {
        console.error('Clipboard access denied:', error);
      }
    };

    const interval = setInterval(autoCopy, 1000);
    return () => clearInterval(interval);
  }, [onClipboardChange]);
}

