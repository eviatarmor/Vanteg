import { useMemo, useState } from "react"
import { BookOpen, CircleHelp, LifeBuoy, Search } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"

import { filterFaq, HELP_DOC_LINKS, HELP_FAQ } from "./model/faq"

export function HelpPage() {
  const { title, subtitle } = getPageCopy("/help")
  const [query, setQuery] = useState("")

  const results = useMemo(() => filterFaq(query), [query])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} icon={CircleHelp} />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
          <div className="grid min-w-0 gap-2">
            <Label htmlFor="help-search">Search help</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="help-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search FAQs, integrations, secrets…"
                className="pl-8"
                autoComplete="off"
              />
            </div>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>FAQ</CardTitle>
              <CardDescription>
                Common questions about the shell, workflows, and connectors.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-(--card-spacing)">
              {results.length === 0 ? (
                <EmptyState
                  icon={CircleHelp}
                  title="No matching articles"
                  description="Try a different search, or browse the docs links below."
                  className="min-h-[16rem]"
                />
              ) : (
                <Accordion type="multiple" className="w-full">
                  {results.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{item.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Repo docs that ship with Vanteg.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pt-(--card-spacing)">
              {HELP_DOC_LINKS.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <BookOpen className="size-4 text-muted-foreground" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">
                      {doc.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {doc.description}
                    </span>
                    <span className="mt-1 block font-mono text-xs text-muted-foreground">
                      {doc.path}
                    </span>
                  </span>
                </a>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Contact support</CardTitle>
              <CardDescription>
                Reach the Vanteg team when docs and FAQ are not enough.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-(--card-spacing) sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Support inbox is a stub for now — we will open a ticket draft
                locally.
              </p>
              <Button
                type="button"
                className="shrink-0"
                onClick={() =>
                  toast.message("Support request started", {
                    description:
                      "Contact form is not wired yet. Email support@vanteg.app.",
                  })
                }
              >
                <LifeBuoy className="size-4" aria-hidden />
                Contact support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
