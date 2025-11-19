import { Terminal } from 'lucide-react';

interface ToolbarFooterProps {
  isTerminalEnabled: boolean;
  onTerminalToggle: () => void;
}

export function ToolbarFooter({ isTerminalEnabled, onTerminalToggle }: ToolbarFooterProps) {
  return (
    <div className="flex items-center justify-center gap-6 px-4 py-3 border-t border-white/5">
      <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
        <kbd className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-zinc-400">
          ⌘
        </kbd>
        <span className="text-zinc-600">+</span>
        <kbd className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-zinc-400">
          K
        </kbd>
      </div>
      <div className="w-px h-3 bg-white/5" />
      <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
        <span className="text-zinc-400">@</span>
        <span className="text-zinc-500">Add Context</span>
      </div>
      <div className="w-px h-3 bg-white/5" />
      <button
        onClick={onTerminalToggle}
        className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full transition-colors ${
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
  );
}

