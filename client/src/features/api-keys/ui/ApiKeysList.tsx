import { KeyRound, MoreHorizontal } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { SECRET_MASK } from "@/features/data/model/mask-secret"

import type { ApiKey } from "../model/types"
import { formatApiKeyWhen } from "./format"

export function ApiKeysList({
  keys,
  onRevoke,
}: {
  keys: ApiKey[]
  onRevoke: (key: ApiKey) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Secret</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium">Last used</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr key={key.id} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3 align-top">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <KeyRound className="size-3.5 text-muted-foreground" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{key.name}</p>
                    {key.scopes.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {key.scopes.map((scope) => (
                          <Badge key={scope} variant="outline" className="capitalize">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-0.5 text-xs text-muted-foreground">No scopes</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 align-top">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                  {key.prefix}
                  {SECRET_MASK}
                </code>
              </td>
              <td className="px-4 py-3 align-top text-muted-foreground">
                {formatApiKeyWhen(key.createdAt)}
              </td>
              <td className="px-4 py-3 align-top text-muted-foreground">
                {formatApiKeyWhen(key.lastUsedAt)}
              </td>
              <td className="px-4 py-3 align-top">
                <Badge variant={key.status === "active" ? "secondary" : "destructive"}>
                  {key.status === "active" ? "Active" : "Revoked"}
                </Badge>
              </td>
              <td className="px-4 py-3 align-top text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Actions for ${key.name}`}
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => onRevoke(key)}
                    >
                      {key.status === "revoked" ? "Delete" : "Revoke"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
