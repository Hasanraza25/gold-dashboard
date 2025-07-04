"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { GoldPriceSource } from "@/lib/gold-api"

interface SourceIndicatorProps {
  sources: GoldPriceSource[]
}

export function SourceIndicator({ sources }: SourceIndicatorProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
        {sources.map((source, index) => (
          <Tooltip key={index}>
            <TooltipTrigger>
              <Badge
                variant="outline"
                className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 text-xs px-2 py-1"
              >
                {source.name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 border-gray-600">
              <div className="text-sm">
                <div>Price: ${source.price.toFixed(2)}</div>
                <div>Weight: {(source.weight * 100).toFixed(0)}%</div>
                <div>Updated: {new Date(source.timestamp).toLocaleTimeString()}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
