import { useEffect, useState, useRef } from "react";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface FileMentionProps {
  text: string;
  cursorPosition: number;
  onFileSelect: (file: string) => void;
  onClose: () => void;
}

export function FileMention({
  text,
  cursorPosition,
  onFileSelect,
  onClose,
}: FileMentionProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    const ws = new WebSocket("ws://localhost:3100/agent");

    const handleOpen = () => {
      ws.send(JSON.stringify({ type: "list-files" }));
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "file_list" && Array.isArray(data.files)) {
          setFiles(data.files);
          setIsLoading(false);
          ws.close();
        }
      } catch (error) {
        console.error('Error parsing message:', error);
        setIsLoading(false);
        ws.close();
      }
    };

    const handleError = () => {
      setIsLoading(false);
      ws.close();
    };

    ws.addEventListener('open', handleOpen);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('error', handleError);

    return () => {
      ws.removeEventListener('open', handleOpen);
      ws.removeEventListener('message', handleMessage);
      ws.removeEventListener('error', handleError);
      ws.close();
    };
  }, []);

  // Get the search query after "@"
  const getQuery = () => {
    const textBeforeCursor = text.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    if (lastAtIndex === -1) return '';
    return textBeforeCursor.slice(lastAtIndex + 1);
  };

  const query = getQuery();
  const filteredFiles = files.filter(file =>
    file.toLowerCase().includes(query.toLowerCase())
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredFiles.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredFiles[selectedIndex]) {
        e.preventDefault();
        onFileSelect(filteredFiles[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredFiles, selectedIndex, onFileSelect, onClose]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (isLoading) {
    return (
      <div className="w-[280px] rounded-md border border-zinc-800/40 bg-zinc-950/90 shadow-lg p-2.5">
        <div className="text-xs text-zinc-500 font-normal">Loading files...</div>
      </div>
    );
  }

  if (filteredFiles.length === 0) {
    return (
      <div className="w-[280px] rounded-md border border-zinc-800/40 bg-zinc-950/90 shadow-lg p-2.5">
        <div className="text-xs text-zinc-600">
          {query ? 'No files found' : 'Type to search...'}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-[280px] rounded-md border border-zinc-800/40 bg-zinc-950/90 shadow-lg backdrop-blur-sm"
    >
      <Command className="rounded-md bg-transparent">
        <CommandList className="max-h-[200px] overflow-y-auto py-1">
          {filteredFiles.map((file, index) => {
            const isSelected = selectedIndex === index;
            
            return (
              <CommandItem
                key={file}
                value={file}
                onSelect={() => onFileSelect(file)}
                className={cn(
                  "cursor-pointer px-2.5 py-1.5 mx-1 rounded-sm transition-all duration-150",
                  isSelected 
                    ? "bg-zinc-900/60 border-l border-zinc-700/50" 
                    : "hover:bg-zinc-900/30 border-l border-transparent"
                )}
              >
                <span className={cn(
                  "text-xs font-mono",
                  isSelected ? "text-zinc-200" : "text-zinc-400"
                )}>
                  {file}
                </span>
              </CommandItem>
            );
          })}
        </CommandList>
      </Command>
    </div>
  );
}
