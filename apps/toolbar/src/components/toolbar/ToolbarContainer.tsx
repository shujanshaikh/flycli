import type { ReactNode, RefObject } from 'react';

interface ToolbarContainerProps {
  position: { x: number; y: number };
  isDragging: boolean;
  isCollapsed: boolean;
  toolbarRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

export function ToolbarContainer({
  position,
  isDragging,
  isCollapsed,
  toolbarRef,
  children,
}: ToolbarContainerProps) {
  return (
    <div
      ref={toolbarRef}
      className="fixed pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isCollapsed ? '52px' : '440px',
        height: isCollapsed ? '52px' : '600px',
        maxHeight: isCollapsed ? '52px' : '600px',
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      <div className="flex flex-col h-full max-h-full bg-zinc-900/80 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl rounded-2xl border border-border/40 shadow-2xl overflow-hidden ring-1 ring-white/5">
        {children}
      </div>
    </div>
  );
}

