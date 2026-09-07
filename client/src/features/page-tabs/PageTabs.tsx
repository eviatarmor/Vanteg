import { useState, type FormEvent, type ReactNode } from "react"
import { Plus, SquareDashed } from "lucide-react"
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

import type { PageTab } from "./types"

export function PageTabs({
  tabs,
  onNew,
  onCreate,
  renderPanel,
  defaultTab,
  title,
  subtitle,
  panelClassName,
}: {
  tabs: readonly PageTab[]
  onNew?: (tab: PageTab) => void
  onCreate?: (tab: PageTab, name: string, value?: string) => void
  renderPanel?: (tab: PageTab) => ReactNode
  defaultTab?: string
  title?: string
  subtitle?: string
  panelClassName?: string
}) {
  const firstTab = tabs[0]?.id
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get("tab")
  const tabId =
    tabs.find((tab) => tab.id === (tabFromUrl ?? defaultTab))?.id ?? firstTab
  const [promptOpen, setPromptOpen] = useState(false)
  const [name, setName] = useState("")
  const [value, setValue] = useState("")

  if (!firstTab) {
    return null
  }

  const activeTab = tabs.find((tab) => tab.id === tabId) ?? tabs[0]
  const newAction = activeTab?.newAction

  function selectTab(nextTab: string) {
    const next = new URLSearchParams(searchParams)
    if (nextTab === firstTab) {
      next.delete("tab")
    } else {
      next.set("tab", nextTab)
    }
    setSearchParams(next, { replace: true })
  }

  function handleNew() {
    if (!activeTab || !newAction) {
      return
    }
    if (onNew) {
      onNew(activeTab)
      return
    }
    setName("")
    setValue("")
    setPromptOpen(true)
  }

  const hasValueField =
    Boolean(newAction?.valueLabel) || Boolean(newAction?.valuePlaceholder)

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed && activeTab) {
      if (hasValueField) {
        onCreate?.(activeTab, trimmed, value)
      } else {
        onCreate?.(activeTab, trimmed)
      }
    }
    setPromptOpen(false)
  }

  return (
    <Tabs
      value={tabId ?? firstTab}
      onValueChange={selectTab}
      className="min-h-0 flex-1 gap-0 overflow-hidden"
    >
      <div className="shrink-0 border-b border-border">
        {title ? (
          <PageHeader
            title={title}
            subtitle={subtitle}
            className="pb-2"
            action={
              newAction ? (
                <Button size="sm" onClick={handleNew}>
                  <Plus />
                  {newAction.label}
                </Button>
              ) : undefined
            }
          />
        ) : null}
        <div className="flex h-12 min-w-0 items-stretch px-6">
          <TabsList
            variant="line"
            className="h-12 min-w-0 w-full justify-start gap-6 overflow-x-auto group-data-horizontal/tabs:h-12 max-md:gap-4"
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
          {!title && newAction ? (
            <div className="ml-3 flex shrink-0 items-center">
              <Button size="sm" onClick={handleNew}>
                <Plus />
                {newAction.label}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className={cn("min-h-0 flex-1 overflow-auto px-6 py-6", panelClassName)}
        >
          {renderPanel ? (
            renderPanel(tab)
          ) : (
            <EmptyState
              icon={SquareDashed}
              title={tab.emptyTitle ?? `No ${tab.label.toLowerCase()} yet`}
              description={tab.description}
              actionLabel={tab.newAction.label}
              onCreate={handleNew}
            />
          )}
        </TabsContent>
      ))}
      {newAction && !onNew ? (
        <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
          <DialogContent>
            <form onSubmit={submitPrompt} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>{newAction.label}</DialogTitle>
                <DialogDescription>
                  {hasValueField
                    ? "Enter a key and value to create a new item."
                    : "Enter a name to create a new item."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="new-item-name">{newAction.nameLabel ?? "Name"}</Label>
                <Input
                  id="new-item-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={newAction.placeholder}
                  autoComplete="off"
                />
              </div>
              {hasValueField ? (
                <div className="grid gap-2">
                  <Label htmlFor="new-item-value">
                    {newAction.valueLabel ?? "Value"}
                  </Label>
                  {newAction.secret ? (
                    <SecretInput
                      id="new-item-value"
                      value={value}
                      onValueChange={setValue}
                      placeholder={newAction.valuePlaceholder ?? "Value"}
                      autoComplete="new-password"
                    />
                  ) : (
                    <Input
                      id="new-item-value"
                      type="text"
                      value={value}
                      onChange={(event) => setValue(event.target.value)}
                      placeholder={newAction.valuePlaceholder ?? "Value"}
                      autoComplete="off"
                    />
                  )}
                </div>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPromptOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </Tabs>
  )
}
