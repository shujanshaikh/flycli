"use client"

import { cn } from "@/lib/utils"
import { chatModel } from "@/lib/models"
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
          "h-8 gap-2 px-3 rounded-full border border-white/5 bg-white/5 shadow-sm transition-all duration-200",
          "text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/10 hover:border-white/10",
          "focus-visible:ring-1 focus-visible:ring-pink-500/20 focus-visible:border-pink-500/20",
          "data-[state=open]:bg-white/10 data-[state=open]:border-white/10 data-[state=open]:text-zinc-200",
          "[&_svg]:size-3.5 [&_svg]:text-zinc-500 [&_svg]:transition-colors group-hover:[&_svg]:text-zinc-400",
          className
        )}
      >
        <SelectValue className="truncate" />
      </SelectTrigger>
      <SelectContent
        align={align}
        container={container ?? undefined}
        className={cn(
          "rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl p-1",
          "min-w-[200px] animate-in fade-in-0 zoom-in-95"
        )}
      >
        {chatModel.map((m) => (
          <SelectItem
            key={m.id}
            value={m.id}
            className="text-xs px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 focus:bg-white/5 focus:text-zinc-200 cursor-pointer transition-colors data-[state=checked]:text-pink-400 data-[state=checked]:bg-pink-500/10"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{m.name}</span>
              {/* <span className="text-[10px] text-zinc-500">{m.description}</span> */}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}