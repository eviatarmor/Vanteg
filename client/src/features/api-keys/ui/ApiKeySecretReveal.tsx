import { useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { maskSecretLast } from "@/features/data/model/mask-secret"

/**
 * One-time secret reveal: display uses maskSecretLast (never type=password).
 * Copy always writes the full plaintext once shown in this dialog.
 */
export function ApiKeySecretReveal({ secret }: { secret: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      toast.success("Secret copied")
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error("Could not copy secret")
    }
  }

  return (
    <div className="grid gap-2 rounded-lg border border-border bg-muted/40 p-3">
      <Label htmlFor="api-key-secret-once">Secret (shown once)</Label>
      <div className="flex gap-2">
        <Input
          id="api-key-secret-once"
          type="text"
          readOnly
          value={maskSecretLast(secret)}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="font-mono text-sm"
        />
        <Button type="button" variant="outline" size="icon" onClick={copy} aria-label="Copy secret">
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Copy and store this secret now. You will not be able to view it again.
      </p>
    </div>
  )
}
