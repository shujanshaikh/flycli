import { MessageCircleDashed } from 'lucide-react';

interface CollapsedToolbarProps {
  onExpand: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function CollapsedToolbar({ onExpand, onMouseDown }: CollapsedToolbarProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="flex items-center justify-center w-full h-full cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        className="flex items-center justify-center p-3 rounded-full hover:bg-white/10 transition-colors"
      >
        <MessageCircleDashed className="w-5 h-5 text-pink-400" />
      </button>
    </div>
  );
}

