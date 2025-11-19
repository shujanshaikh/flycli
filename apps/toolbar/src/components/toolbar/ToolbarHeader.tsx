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
      className="flex items-center justify-between px-5 py-4 cursor-grab active:cursor-grabbing"
      onMouseDown={onMouseDown}
    >
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-2 text-zinc-200 text-sm font-medium tracking-tight">
          <MousePointerClick className="size-4 text-pink-500" />
          flycli
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
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 rounded-full hover:bg-white/5"
        >
          <MessageCircleDashed className="size-4" />
        </button>
      </div>
    </div>
  );
}

