import { useState, type FormEvent } from "react"

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

import { databaseColumnTypes } from "../model/column-types"
import type { DatabaseCellVariant, SelectOption } from "../model/types"

export function AddColumnDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (input: {
    name: string
    variant: DatabaseCellVariant
    options?: SelectOption[]
  }) => void
}) {
  const [name, setName] = useState("")
  const [variant, setVariant] = useState<DatabaseCellVariant>("short-text")
  const [optionsText, setOptionsText] = useState("")

  function reset() {
    setName("")
    setVariant("short-text")
    setOptionsText("")
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      return
    }
    const options =
      variant === "select"
        ? optionsText
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
            .map((label) => ({
              label,
              value: label.toLowerCase().replace(/\s+/g, "-"),
            }))
        : undefined
    onAdd({ name: trimmed, variant, options })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset()
        }
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Add column</DialogTitle>
            <DialogDescription>
              Name the column and choose how its values are edited.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="column-name">Name</Label>
            <Input
              id="column-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Column name"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="column-type">Type</Label>
            <Select
              value={variant}
              onValueChange={(value) => {
                if (!value) {
                  return
                }
                setVariant(value as DatabaseCellVariant)
              }}
            >
              <SelectTrigger id="column-type" className="w-full" aria-label="Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {databaseColumnTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {variant === "select" ? (
            <div className="grid gap-2">
              <Label htmlFor="column-options">Options</Label>
              <Input
                id="column-options"
                value={optionsText}
                onChange={(event) => setOptionsText(event.target.value)}
                placeholder="Admin, Member, Guest"
                autoComplete="off"
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Add column
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
