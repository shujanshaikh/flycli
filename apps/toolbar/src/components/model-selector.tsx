"use client"

import { cn } from "@/lib/utils"
import { models } from "@/lib/models"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ModelSelectorProps = {
  model: string
  setModel: (model: string) => void
  /** Optional container for the dropdown portal (e.g., floating toolbar root) */
  container?: HTMLElement | null
  className?: string
  size?: "sm" | "default"
  align?: "start" | "center" | "end"
}

export function ModelSelector({
  model,
  setModel,
  container,
  className,
  size = "sm",
  align = "end",
}: ModelSelectorProps) {
  return (
    <Select value={model} onValueChange={setModel}>
      <SelectTrigger
        size={size}
        aria-label="Select model"
        className={cn(
          // Minimal, no border/background when idle
          "border-0 border-transparent shadow-none bg-transparent rounded-none px-2 text-[15px] leading-6",
          // Subtle hover/active text emphasis without surfaces
          "text-muted-foreground whitespace-nowrap transition-none",
          // Ensure NO background/border in dark/hover/focus/open states
          "hover:bg-transparent data-[state=open]:bg-transparent focus-visible:border-0 focus-visible:ring-0",
          "dark:bg-transparent dark:hover:bg-transparent",
          // Keep icon color consistent as well
          "[&_svg]:text-muted-foreground [&_svg]:opacity-60 data-[state=open]:[&_svg]:text-muted-foreground",
          // Remove default ring visuals
          "focus-visible:ring-0 focus-visible:outline-none",
          className
        )}
      >
        <SelectValue className="truncate text-muted-foreground" />
      </SelectTrigger>
      <SelectContent
        align={align}
        container={container ?? undefined}
        className={cn(
          // Match overall app aesthetic used elsewhere
          "rounded-md bg-zinc-950/95 border border-zinc-800/80 text-zinc-200 shadow-md min-w-0 w-[var(--radix-select-trigger-width)]"
        )}
      >
        {models.map((m) => (
          <SelectItem
            key={m.id}
            value={m.id}
            className="text-sm px-2 py-1.5 hover:bg-zinc-800/60 focus:bg-zinc-800/60 data-[state=checked]:text-foreground data-[state=checked]:font-medium data-[state=checked]:[&_svg]:text-foreground"
          >
            {m.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}