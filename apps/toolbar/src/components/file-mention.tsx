import { useEffect, useState, useRef } from "react";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { FileIcon, Loader2 } from "lucide-react";
import { WS_URL } from "@/lib/constant";

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
  const selectedItemRef = useRef<HTMLDivElement>(null);
  const commandListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    const ws = new WebSocket(WS_URL);

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

  // Scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    } else if (commandListRef.current) {
      // Fallback: find selected item by index
      const items = commandListRef.current.querySelectorAll('[data-slot="command-item"]');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    // Only set up keyboard handler when popover is visible
    if (filteredFiles.length === 0 && !isLoading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInTextarea = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT';
      
      // Only handle if focused on textarea/input when popover is visible
      if (!isInTextarea && !containerRef.current?.contains(target)) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => Math.min(prev + 1, filteredFiles.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (filteredFiles[selectedIndex]) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          onFileSelect(filteredFiles[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    // Use capture phase to intercept before textarea handles it
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [filteredFiles, selectedIndex, onFileSelect, onClose, isLoading]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (isLoading) {
    return (
      <div className="w-[300px] rounded-lg border border-white/10 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl shadow-2xl ring-1 ring-white/5 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Loader2 className="size-3.5 animate-spin text-zinc-400" />
          <span className="text-xs text-zinc-400 font-medium">Loading files...</span>
        </div>
      </div>
    );
  }

  if (filteredFiles.length === 0) {
    return (
      <div className="w-[300px] rounded-lg border border-white/10 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl shadow-2xl ring-1 ring-white/5 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <FileIcon className="size-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-500">
            {query ? 'No files found' : 'Type to search files...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-[300px] rounded-lg border border-white/10 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl shadow-2xl ring-1 ring-white/5 overflow-hidden"
    >
      {query && (
        <div className="px-3 py-2 border-b border-white/5">
          <span className="text-xs text-zinc-500 font-medium">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'} found
          </span>
        </div>
      )}
      <Command className="rounded-lg bg-transparent">
        <CommandList ref={commandListRef} className="max-h-[240px] overflow-y-auto py-1.5">
          {filteredFiles.map((file, index) => {
            const isSelected = selectedIndex === index;
            
            return (
              <CommandItem
                key={file}
                value={file}
                onSelect={() => onFileSelect(file)}
                className={cn(
                  "cursor-pointer px-3 py-2 mx-1.5 rounded-md transition-all duration-200",
                  isSelected 
                    ? "bg-white/10 border border-white/20 shadow-sm" 
                    : "hover:bg-white/5 border border-transparent"
                )}
              >
                <div 
                  ref={isSelected ? selectedItemRef : null}
                  className="flex items-center gap-2 w-full"
                >
                  <FileIcon className={cn(
                    "size-3.5 flex-shrink-0",
                    isSelected ? "text-pink-400/90" : "text-zinc-500"
                  )} />
                  <span className={cn(
                    "text-xs font-mono truncate flex-1",
                    isSelected ? "text-zinc-100" : "text-zinc-400"
                  )}>
                    {file}
                  </span>
                </div>
              </CommandItem>
            );
          })}
        </CommandList>
      </Command>
    </div>
  );
}
