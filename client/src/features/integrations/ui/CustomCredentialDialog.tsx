import { useEffect, useState } from "react"
import { toast } from "sonner"

import {
  CUSTOM_AUTH_KINDS,
  customAuthKindLabel,
  customCredentialFieldsFor,
  type CustomAuthKind,
  type CustomCredential,
} from "@workspace/integrations"
import { Button } from "@workspace/ui/components/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { SecretInput } from "@/components/secret-input"

import { createCustomCredential, updateCustomCredential } from "../model/store"

export function CustomCredentialDialog({
  open,
  credential,
  onOpenChange,
}: {
  open: boolean
  credential: CustomCredential | null
  onOpenChange: (open: boolean) => void
}) {
  const editing = credential !== null
  const [name, setName] = useState("")
  const [kind, setKind] = useState<CustomAuthKind>("bearer")
  const [values, setValues] = useState<Record<string, string>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    if (credential) {
      setName(credential.name)
      setKind(credential.kind)
      const next: Record<string, string> = {}
      for (const field of customCredentialFieldsFor(credential.kind)) {
        next[field.id] = field.secret ? "" : (credential.fields[field.id] ?? "")
      }
      setValues(next)
    } else {
      setName("")
      setKind("bearer")
      setValues({})
    }
    setFieldErrors({})
    setPending(false)
  }, [open, credential])

  const fields = customCredentialFieldsFor(kind)

  function onKindChange(nextKind: CustomAuthKind) {
    setKind(nextKind)
    setValues({})
    setFieldErrors({})
  }

  async function submit() {
    if (pending) {
      return
    }
    setPending(true)
    setFieldErrors({})
    try {
      const result = editing
        ? await updateCustomCredential({
            id: credential.id,
            name,
            kind,
            fields: values,
          })
        : await createCustomCredential({
            name,
            kind,
            fields: values,
          })
      if (!result.ok) {
        if (result.error.fields) {
          setFieldErrors(result.error.fields)
        }
        toast.error(result.error.message)
        return
      }
      toast.success(editing ? "Credential updated" : "Credential created")
      onOpenChange(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) {
          return
        }
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit credential" : "New credential"}
          </DialogTitle>
          <DialogDescription>
            Typed auth configs agents and workflows can reference by id.
            Separate from managed connector connections.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="custom-credential-name">Name</Label>
            <Input
              id="custom-credential-name"
              value={name}
              disabled={pending}
              autoComplete="off"
              aria-invalid={Boolean(fieldErrors.name)}
              onChange={(event) => setName(event.target.value)}
              placeholder="Production API"
            />
            {fieldErrors.name ? (
              <p className="text-xs text-destructive">{fieldErrors.name}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="custom-credential-kind">Kind</Label>
            <Select
              value={kind}
              disabled={pending}
              onValueChange={(value) => {
                if (value) {
                  onKindChange(value as CustomAuthKind)
                }
              }}
            >
              <SelectTrigger
                id="custom-credential-kind"
                className="w-full"
                aria-label="Kind"
              >
                <SelectValue placeholder="Select kind" />
              </SelectTrigger>
              <SelectContent>
                {CUSTOM_AUTH_KINDS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {customAuthKindLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.kind ? (
              <p className="text-xs text-destructive">{fieldErrors.kind}</p>
            ) : null}
          </div>
          {fields.map((field) => (
            <div key={field.id} className="grid gap-2">
              <Label htmlFor={`custom-credential-${field.id}`}>
                {field.label}
              </Label>
              {field.secret ? (
                <SecretInput
                  id={`custom-credential-${field.id}`}
                  value={values[field.id] ?? ""}
                  disabled={pending}
                  placeholder={
                    editing
                      ? "Leave blank to keep current"
                      : (field.placeholder ?? field.label)
                  }
                  autoComplete="new-password"
                  aria-invalid={Boolean(fieldErrors[field.id])}
                  onValueChange={(value) =>
                    setValues((current) => ({ ...current, [field.id]: value }))
                  }
                />
              ) : (
                <Input
                  id={`custom-credential-${field.id}`}
                  value={values[field.id] ?? ""}
                  disabled={pending}
                  placeholder={field.placeholder ?? field.label}
                  autoComplete="off"
                  aria-invalid={Boolean(fieldErrors[field.id])}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.id]: event.target.value,
                    }))
                  }
                />
              )}
              {fieldErrors[field.id] ? (
                <p className="text-xs text-destructive">
                  {fieldErrors[field.id]}
                </p>
              ) : null}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={() => void submit()}
          >
            {pending
              ? editing
                ? "Saving…"
                : "Creating…"
              : editing
                ? "Save"
                : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
