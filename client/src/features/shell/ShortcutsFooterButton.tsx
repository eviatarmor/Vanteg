import { Keyboard } from "lucide-react"

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

import { useKeyboardShortcuts } from "@/features/shortcuts/KeyboardShortcutsProvider"

const menuButtonClassName =
  "h-9 rounded-xl px-2.5 text-[15px] font-normal text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:text-sidebar-foreground/55 data-active:[&_svg]:text-sidebar-primary group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:p-0!"

export function ShortcutsFooterButton() {
  const { openShortcuts } = useKeyboardShortcuts()

  return (
    <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
      <SidebarMenuButton
        type="button"
        tooltip="Keyboard shortcuts"
        className={menuButtonClassName}
        onClick={openShortcuts}
      >
        <Keyboard />
        <span className="group-data-[collapsible=icon]:hidden">Shortcuts</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
