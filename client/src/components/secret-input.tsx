import type { ComponentProps } from "react"

import { Input } from "@workspace/ui/components/input"

import { applySecretInput, maskSecretLast } from "@/features/data/model/mask-secret"

export function SecretInput({
  value,
  onValueChange,
  onChange,
  ...props
}: Omit<ComponentProps<typeof Input>, "type" | "value"> & {
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <Input
      {...props}
      type="text"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      value={maskSecretLast(value)}
      onChange={(event) => {
        onValueChange(applySecretInput(value, event.target.value))
        onChange?.(event)
      }}
    />
  )
}
