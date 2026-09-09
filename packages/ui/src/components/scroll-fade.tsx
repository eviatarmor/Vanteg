"use client"

import * as React from "react"
import { cn } from "cn"

import { useScrollOverflow } from "@workspace/ui/hooks/use-scroll-overflow"

export function ScrollFadeEdge({
  visible,
  className,
}: {
  visible: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden
      data-slot="scroll-fade"
      data-visible={visible ? "true" : "false"}
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 to-transparent transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        backgroundImage:
          "linear-gradient(to top, var(--scroll-fade-from, var(--background)), transparent)",
      }}
    />
  )
}

export function ScrollFade({
  className,
  viewportClassName,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  viewportClassName?: string
}) {
  const { ref, canScrollDown } = useScrollOverflow<HTMLDivElement>()

  return (
    <div className={cn("relative min-h-0 min-w-0", className)}>
      <div
        {...props}
        ref={ref}
        className={cn("size-full overflow-auto", viewportClassName)}
      >
        {children}
      </div>
      <ScrollFadeEdge visible={canScrollDown} />
    </div>
  )
}
