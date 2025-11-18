import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDragAndDropReturn {
  position: Position;
  isDragging: boolean;
  toolbarRef: RefObject<HTMLDivElement | null>;
  handleMouseDown: (e: React.MouseEvent) => void;
}

export function useDragAndDrop(initialPosition: Position = { x: 20, y: 20 }): UseDragAndDropReturn {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('textarea') ||
      target.closest('input') ||
      target.closest('[role="textbox"]') ||
      target.closest('a')
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return {
    position,
    isDragging,
    toolbarRef,
    handleMouseDown,
  };
}

