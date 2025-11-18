import { useEffect } from 'react';

export function useKeyboardShortcuts(
  shortcut: string,
  callback: () => void,
  dependencies: unknown[] = []
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const [modifier, key] = shortcut.split('+').map(s => s.trim().toLowerCase());
      const isModifierPressed = 
        (modifier === 'cmd' || modifier === 'ctrl') && (e.metaKey || e.ctrlKey);
      const isKeyPressed = e.key.toLowerCase() === key;

      if (isModifierPressed && isKeyPressed) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, callback, ...dependencies]);
}

