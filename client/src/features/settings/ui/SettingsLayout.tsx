import type { ComponentProps } from "react"
import { cn } from "@workspace/ui/lib/utils"

function SettingsLayout({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-layout"
      className={cn("flex flex-col gap-10", className)}
      {...props}
    />
  )
}

function SettingsSection({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      data-slot="settings-section"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

function SettingsHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="settings-header"
      className={cn("grid gap-1 border-b pb-4", className)}
      {...props}
    />
  )
}

function SettingsTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      data-slot="settings-title"
      className={cn(
        "text-base font-medium tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  )
}

function SettingsDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="settings-description"
      className={cn("max-w-2xl text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function SettingsContent({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="settings-content" className={className} {...props} />
}

function SettingsFooter({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer
      data-slot="settings-footer"
      className={cn("flex flex-wrap items-center justify-end gap-2", className)}
      {...props}
    />
  )
}

function SettingsField({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-field"
      className={cn(
        "grid grid-cols-1 gap-2 sm:grid-cols-[10rem_minmax(0,24rem)] sm:items-center sm:gap-x-6",
        className
      )}
      {...props}
    />
  )
}

export {
  SettingsLayout,
  SettingsSection,
  SettingsHeader,
  SettingsTitle,
  SettingsDescription,
  SettingsContent,
  SettingsFooter,
  SettingsField,
}
