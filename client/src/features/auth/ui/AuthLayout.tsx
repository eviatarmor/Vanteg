import type { ReactNode } from "react"

import { getWorkspaceIdentity } from "@/features/shell/model/catalog"

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}) {
  const identity = getWorkspaceIdentity()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {identity.productName}
        </p>
      </div>
      <div className="w-full max-w-md rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10">
        <div className="grid gap-1 border-b border-border px-6 py-5">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer ? (
          <div className="border-t border-border bg-muted/40 px-6 py-4 text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
