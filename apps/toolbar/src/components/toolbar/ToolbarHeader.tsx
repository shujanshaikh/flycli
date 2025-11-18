import { MessageCircleDashed, MousePointerClick } from 'lucide-react';
import { ModelSelector } from '@/components/model-selector';
import type { RefObject } from 'react';

interface ToolbarHeaderProps {
  model: string;
  setModel: (model: string) => void;
  onCollapse: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  containerRef: RefObject<HTMLDivElement | null>;
}

export function ToolbarHeader({
  model,
  setModel,
  onCollapse,
  onMouseDown,
  containerRef,
}: ToolbarHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing border-b border-border/30"
      onMouseDown={onMouseDown}
    >
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-2.5 py-1 text-pink-400/90 text-xs font-medium tracking-wide">
          flycli
          <MousePointerClick className="size-5" />
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ModelSelector
          model={model}
          setModel={setModel}
          container={containerRef.current}
          size="sm"
          className="text-zinc-400 hover:text-zinc-200 transition-colors"
        />
        <button
          onClick={onCollapse}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-md hover:bg-white/5"
        >
          <MessageCircleDashed className="size-4" />
        </button>
      </div>
    </div>
  );
}

