import { useState, type FormEvent, type ReactNode } from "react"
import { Plus, SquareDashed, type LucideIcon } from "lucide-react"
import { useSearchParams } from "react-router"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

import { SecretInput } from "@/components/secret-input"
import { EmptyState } from "@/features/empty-state/EmptyState"
import { PageHeader } from "@/features/page-header/PageHeader"

import type { PageTab, PageTabNewAction } from "./types"

function resolveTabId(
  tabs: readonly PageTab[],
  tabFromUrl: string | null,
  defaultTab: string | undefined,
  firstTab: string | undefined
) {
  const requested = tabFromUrl ?? defaultTab
  return tabs.find((tab) => tab.id === requested)?.id ?? firstTab
}

function tabHasValueField(action: PageTabNewAction | undefined) {
  if (!action) {
    return false
  }
  return Boolean(action.valueLabel) || Boolean(action.valuePlaceholder)
}

function nextTabParams(
  searchParams: URLSearchParams,
  nextTab: string,
  firstTab: string
) {
  const next = new URLSearchParams(searchParams)
  if (nextTab === firstTab) {
    next.delete("tab")
    return next
  }
  next.set("tab", nextTab)
  return next
}

function startTabCreate({
  activeTab,
  newAction,
  onNew,
  openPrompt,
}: {
  activeTab: PageTab | undefined
  newAction: PageTabNewAction | undefined
  onNew?: (tab: PageTab) => void
  openPrompt: () => void
}) {
  if (!activeTab || !newAction) {
    return
  }
  if (onNew) {
    onNew(activeTab)
    return
  }
  openPrompt()
}

function commitTabCreate({
  name,
  activeTab,
  hasValueField,
  value,
  onCreate,
}: {
  name: string
  activeTab: PageTab | undefined
  hasValueField: boolean
  value: string
  onCreate?: (tab: PageTab, name: string, value?: string) => void
}) {
  const trimmed = name.trim()
  if (!trimmed || !activeTab) {
    return
  }
  if (hasValueField) {
    onCreate?.(activeTab, trimmed, value)
    return
  }
  onCreate?.(activeTab, trimmed)
}

function PageTabsNewButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <Button size="sm" onClick={onClick}>
      <Plus />
      {label}
    </Button>
  )
}

function PageTabsTitle({
  title,
  subtitle,
  icon,
  newAction,
  onNew,
}: {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  newAction: PageTabNewAction | undefined
  onNew: () => void
}) {
  if (!title) {
    return null
  }
  if (!newAction) {
    return (
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        className="border-b-0 pb-2"
      />
    )
  }
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      icon={icon}
      className="border-b-0 pb-2"
      action={<PageTabsNewButton label={newAction.label} onClick={onNew} />}
    />
  )
}

function PageTabsInlineNew({
  title,
  newAction,
  onNew,
}: {
  title?: string
  newAction: PageTabNewAction | undefined
  onNew: () => void
}) {
  if (title || !newAction) {
    return null
  }
  return (
    <div className="ml-3 flex shrink-0 items-center">
      <PageTabsNewButton label={newAction.label} onClick={onNew} />
    </div>
  )
}

function PageTabsToolbar({
  title,
  subtitle,
  icon,
  tabs,
  newAction,
  onNew,
}: {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  tabs: readonly PageTab[]
  newAction: PageTabNewAction | undefined
  onNew: () => void
}) {
  return (
    <div className="shrink-0 border-b border-border">
      <PageTabsTitle
        title={title}
        subtitle={subtitle}
        icon={icon}
        newAction={newAction}
        onNew={onNew}
      />
      <div className="flex h-12 min-w-0 items-stretch px-6">
        <TabsList
          variant="line"
          className="h-12 w-full min-w-0 justify-start gap-6 overflow-x-auto group-data-horizontal/tabs:h-12 max-md:gap-4"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="h-full flex-none px-1 text-[15px] group-data-horizontal/tabs:after:bottom-0"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <PageTabsInlineNew title={title} newAction={newAction} onNew={onNew} />
      </div>
    </div>
  )
}

function PageTabsPanelBody({
  tab,
  renderPanel,
  onCreate,
}: {
  tab: PageTab
  renderPanel?: (tab: PageTab, helpers: { openCreate: () => void }) => ReactNode
  onCreate: () => void
}) {
  if (renderPanel) {
    return renderPanel(tab, { openCreate: onCreate })
  }
  return (
    <EmptyState
      icon={SquareDashed}
      title={tab.emptyTitle ?? `No ${tab.label.toLowerCase()} yet`}
      description={tab.description}
      actionLabel={tab.newAction.label}
      onCreate={onCreate}
    />
  )
}

function PageTabsPanel({
  tab,
  renderPanel,
  panelClassName,
  onCreate,
}: {
  tab: PageTab
  renderPanel?: (tab: PageTab, helpers: { openCreate: () => void }) => ReactNode
  panelClassName?: string
  onCreate: () => void
}) {
  return (
    <TabsContent
      value={tab.id}
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-auto px-6 py-6",
        panelClassName
      )}
    >
      <PageTabsPanelBody
        tab={tab}
        renderPanel={renderPanel}
        onCreate={onCreate}
      />
    </TabsContent>
  )
}

function CreateItemValueField({
  newAction,
  value,
  onValueChange,
}: {
  newAction: PageTabNewAction
  value: string
  onValueChange: (value: string) => void
}) {
  if (newAction.secret) {
    return (
      <SecretInput
        id="new-item-value"
        value={value}
        onValueChange={onValueChange}
        placeholder={newAction.valuePlaceholder ?? "Value"}
        autoComplete="new-password"
      />
    )
  }
  return (
    <Input
      id="new-item-value"
      type="text"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      placeholder={newAction.valuePlaceholder ?? "Value"}
      autoComplete="off"
    />
  )
}

function CreateItemValueBlock({
  newAction,
  hasValueField,
  value,
  onValueChange,
}: {
  newAction: PageTabNewAction
  hasValueField: boolean
  value: string
  onValueChange: (value: string) => void
}) {
  if (!hasValueField) {
    return null
  }
  return (
    <div className="grid gap-2">
      <Label htmlFor="new-item-value">{newAction.valueLabel ?? "Value"}</Label>
      <CreateItemValueField
        newAction={newAction}
        value={value}
        onValueChange={onValueChange}
      />
    </div>
  )
}

function createItemDescription(hasValueField: boolean) {
  if (hasValueField) {
    return "Enter a key and value to create a new item."
  }
  return "Enter a name to create a new item."
}

function CreateItemDialog({
  newAction,
  onNew,
  promptOpen,
  onPromptOpenChange,
  name,
  value,
  hasValueField,
  onNameChange,
  onValueChange,
  onSubmit,
}: {
  newAction: PageTabNewAction | undefined
  onNew?: (tab: PageTab) => void
  promptOpen: boolean
  onPromptOpenChange: (open: boolean) => void
  name: string
  value: string
  hasValueField: boolean
  onNameChange: (value: string) => void
  onValueChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  if (!newAction || onNew) {
    return null
  }
  return (
    <Dialog open={promptOpen} onOpenChange={onPromptOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{newAction.label}</DialogTitle>
            <DialogDescription>
              {createItemDescription(hasValueField)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="new-item-name">
              {newAction.nameLabel ?? "Name"}
            </Label>
            <Input
              id="new-item-name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder={newAction.placeholder}
              autoComplete="off"
            />
          </div>
          <CreateItemValueBlock
            newAction={newAction}
            hasValueField={hasValueField}
            value={value}
            onValueChange={onValueChange}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onPromptOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function PageTabs({
  tabs,
  onNew,
  onCreate,
  renderPanel,
  defaultTab,
  title,
  subtitle,
  icon,
  panelClassName,
}: {
  tabs: readonly PageTab[]
  onNew?: (tab: PageTab) => void
  onCreate?: (tab: PageTab, name: string, value?: string) => void
  renderPanel?: (tab: PageTab, helpers: { openCreate: () => void }) => ReactNode
  defaultTab?: string
  title?: string
  subtitle?: string
  icon?: LucideIcon
  panelClassName?: string
}) {
  const firstTab = tabs[0]?.id
  const [searchParams, setSearchParams] = useSearchParams()
  const tabId = resolveTabId(
    tabs,
    searchParams.get("tab"),
    defaultTab,
    firstTab
  )
  const [promptOpen, setPromptOpen] = useState(false)
  const [name, setName] = useState("")
  const [value, setValue] = useState("")

  if (!firstTab) {
    return null
  }

  const activeTab = tabs.find((tab) => tab.id === tabId) ?? tabs[0]
  const newAction = activeTab?.newAction
  const hasValueField = tabHasValueField(newAction)

  function selectTab(nextTab: string) {
    setSearchParams(nextTabParams(searchParams, nextTab, firstTab), {
      replace: true,
    })
  }

  function handleNew() {
    startTabCreate({
      activeTab,
      newAction,
      onNew,
      openPrompt: () => {
        setName("")
        setValue("")
        setPromptOpen(true)
      },
    })
  }

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    commitTabCreate({
      name,
      activeTab,
      hasValueField,
      value,
      onCreate,
    })
    setPromptOpen(false)
  }

  return (
    <Tabs
      value={tabId ?? firstTab}
      onValueChange={selectTab}
      className="min-h-0 min-w-0 flex-1 gap-0 overflow-hidden"
    >
      <PageTabsToolbar
        title={title}
        subtitle={subtitle}
        icon={icon}
        tabs={tabs}
        newAction={newAction}
        onNew={handleNew}
      />
      {tabs.map((tab) => (
        <PageTabsPanel
          key={tab.id}
          tab={tab}
          renderPanel={renderPanel}
          panelClassName={panelClassName}
          onCreate={handleNew}
        />
      ))}
      <CreateItemDialog
        newAction={newAction}
        onNew={onNew}
        promptOpen={promptOpen}
        onPromptOpenChange={setPromptOpen}
        name={name}
        value={value}
        hasValueField={hasValueField}
        onNameChange={setName}
        onValueChange={setValue}
        onSubmit={submitPrompt}
      />
    </Tabs>
  )
}
