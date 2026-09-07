import { Fragment } from "react"
import { NavLink, useLocation, useNavigate } from "react-router"
import { ChevronsUpDown, LogOut, SlidersHorizontal } from "lucide-react"

import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@workspace/ui/components/sidebar"

import {
  getCurrentUser,
  getFooterNav,
  getNavSections,
  getUserMenuItems,
  getWorkspaceIdentity,
} from "./model/catalog"
import { logout } from "./model/session"
import { matchActivePath } from "./model/match-path"
import type { NavItem } from "./model/types"
import { navIcons } from "./nav-icons"

const menuButtonClassName =
  "h-9 rounded-xl px-2.5 text-[15px] font-normal text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:text-sidebar-foreground/55 data-active:[&_svg]:text-sidebar-primary group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:p-0!"

function CollapsedSeparator() {
  return (
    <SidebarSeparator className="mx-auto hidden max-w-4 bg-sidebar-foreground/20 group-data-[collapsible=icon]:my-1 group-data-[collapsible=icon]:block group-data-[collapsible=icon]:w-4!" />
  )
}

function NavItemRow({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = navIcons[item.icon]
  const isActive = matchActivePath(pathname, item.path)

  return (
    <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.label}
        className={menuButtonClassName}
      >
        <NavLink to={item.path}>
          <Icon />
          <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
        </NavLink>
      </SidebarMenuButton>
      {item.badgeCount != null && item.badgeCount > 0 ? (
        <SidebarMenuBadge className="right-2.5 h-5 min-w-5 rounded-full bg-freeze-badge px-1.5 text-[11px] font-semibold text-white peer-data-active/menu-button:text-white group-data-[collapsible=icon]:top-0 group-data-[collapsible=icon]:right-0 group-data-[collapsible=icon]:size-4 group-data-[collapsible=icon]:min-w-4 group-data-[collapsible=icon]:translate-x-1/4 group-data-[collapsible=icon]:-translate-y-1/4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:text-[9px]">
          {item.badgeCount}
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  )
}

function UserMenu() {
  const user = getCurrentUser()
  const items = getUserMenuItems()
  const navigate = useNavigate()

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={user.displayName}
              aria-label={`${user.displayName} account menu`}
              className="h-auto rounded-xl px-2 py-1 data-open:bg-sidebar-accent group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:p-0!"
            >
              <Avatar className="size-9 after:hidden group-data-[collapsible=icon]:size-8">
                <AvatarFallback className="bg-freeze-avatar text-xs font-medium text-sidebar-foreground">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium">
                  {user.displayName}
                </span>
                <span className="truncate text-sm text-sidebar-muted">
                  {user.role}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={8}
            className="w-56"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <span className="font-medium">{user.displayName}</span>
                <span className="text-muted-foreground">{user.role}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {items.map((item) =>
              item.id === "settings" ? (
                <DropdownMenuItem
                  key={item.id}
                  onSelect={() => navigate(item.href)}
                >
                  <SlidersHorizontal />
                  {item.label}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  key={item.id}
                  variant="destructive"
                  onSelect={() => logout()}
                >
                  <LogOut />
                  {item.label}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar() {
  const location = useLocation()
  const identity = getWorkspaceIdentity()
  const sections = getNavSections()
  const footerNav = getFooterNav()

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border group-data-[collapsible=icon]:overflow-hidden">
      <SidebarHeader className="gap-1 px-4 pt-5 pb-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <p className="text-2xl leading-none font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
          {identity.productName}
        </p>
        <p
          className="hidden size-8 items-center justify-center text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:flex"
          aria-hidden
        >
          {identity.productName.slice(0, 1)}
        </p>
      </SidebarHeader>
      <SidebarContent className="px-2 group-data-[collapsible=icon]:flex-none! group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-2">
        {sections.map((section, index) => (
          <Fragment key={section.id}>
            {index > 0 ? <CollapsedSeparator /> : null}
            <SidebarGroup className="p-1 pt-3 group-data-[collapsible=icon]:p-0">
              <SidebarGroupLabel className="h-7 px-2.5 text-[11px] font-medium tracking-[0.14em] text-sidebar-muted uppercase group-data-[collapsible=icon]:hidden">
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2">
                  {section.items.map((item) => (
                    <NavItemRow
                      key={item.id}
                      item={item}
                      pathname={location.pathname}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </Fragment>
        ))}
      </SidebarContent>
      <SidebarFooter className="gap-3 px-3 pb-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pt-0 group-data-[collapsible=icon]:pb-2">
        <CollapsedSeparator />
        <div className="flex w-full flex-col gap-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2">
          <SidebarMenu className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2">
            {footerNav.map((item) => (
              <NavItemRow
                key={item.id}
                item={item}
                pathname={location.pathname}
              />
            ))}
          </SidebarMenu>
          <UserMenu />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
