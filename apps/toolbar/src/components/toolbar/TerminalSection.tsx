import { TerminalComponent } from '@/components/Terminal';

interface TerminalSectionProps {
  enabled: boolean;
}

export function TerminalSection({ enabled }: TerminalSectionProps) {
  if (!enabled) {
    return null;
  }

  return (
    <div className="border-t border-border/30 h-64 overflow-hidden">
      <TerminalComponent enabled={enabled} />
    </div>
  );
}

