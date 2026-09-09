import { useEffect, useState, type FormEvent } from "react"

import { Button } from "@workspace/ui/components/button"
import { Cascader } from "@workspace/ui/components/cascader"
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
import { Switch } from "@workspace/ui/components/switch"
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputList,
} from "@workspace/ui/components/tags-input"

import {
  databaseColumnTypeTree,
  findColumnType,
  findColumnTypeId,
  isTextColumnVariant,
  isTimeColumnVariant,
} from "../model/column-types"
import type { DatabaseColumn, DatabaseCellVariant, SelectOption, TextFormat } from "../model/types"

function optionFromLabel(label: string): SelectOption {
  return {
    label,
    value: label.toLowerCase().replace(/\s+/g, "-"),
  }
}

const typeItems = databaseColumnTypeTree.map((type) => ({
  value: type.id,
  label: type.label,
  children: type.children?.map((child) => ({
    value: child.id,
    label: child.label,
  })),
}))

export function AddColumnDialog({
  open,
  column,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  column?: DatabaseColumn
  onOpenChange: (open: boolean) => void
  onAdd: (input: {
    name: string
    variant: DatabaseCellVariant
    options?: SelectOption[]
    regex?: string
    textFormat?: TextFormat
    showSeconds?: boolean
  }) => void
}) {
  const [name, setName] = useState("")
  const [typeId, setTypeId] = useState("plain")
  const [regex, setRegex] = useState("")
  const [options, setOptions] = useState<string[]>([])
  const [showSeconds, setShowSeconds] = useState(false)
  const isEdit = Boolean(column)

  const selectedType = findColumnType(typeId) ?? findColumnType("plain")
  const variant = selectedType?.variant ?? "short-text"
  const showRegex = isTextColumnVariant(variant)
  const showTimeOptions = isTimeColumnVariant(variant)

  function reset() {
    setName("")
    setTypeId("plain")
    setRegex("")
    setOptions([])
    setShowSeconds(false)
  }

  useEffect(() => {
    if (!open) {
      return
    }
    if (!column) {
      reset()
      return
    }
    setName(column.name)
    setTypeId(findColumnTypeId(column))
    setRegex(column.regex ?? "")
    setOptions(column.options?.map((option) => option.label) ?? [])
    setShowSeconds(Boolean(column.showSeconds))
  }, [open, column])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !selectedType || selectedType.children?.length) {
      return
    }
    onAdd({
      name: trimmed,
      variant,
      ...(variant === "select"
        ? {
            options: options
              .map((label) => optionFromLabel(label.trim()))
              .filter((item) => item.label),
          }
        : {}),
      ...(showRegex
        ? {
            ...(regex.trim() ? { regex: regex.trim() } : {}),
            ...(selectedType.textFormat ? { textFormat: selectedType.textFormat } : {}),
          }
        : {}),
      ...(showTimeOptions && showSeconds ? { showSeconds: true } : {}),
    })
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
            <DialogTitle>{isEdit ? "Edit column" : "Add column"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Rename the column or change how its values are edited."
                : "Name the column and choose how its values are edited."}
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
            <Cascader
              id="column-type"
              aria-label="Type"
              items={typeItems}
              value={typeId}
              onValueChange={(next) => {
                const type = findColumnType(next)
                if (!type || type.children?.length) {
                  return
                }
                setTypeId(next)
                setRegex(type.regex ?? "")
                if (type.variant !== "select") {
                  setOptions([])
                }
                if (!isTimeColumnVariant(type.variant)) {
                  setShowSeconds(false)
                }
              }}
            />
          </div>
          {showRegex ? (
            <div className="grid gap-2">
              <Label htmlFor="column-regex">Regex</Label>
              <Input
                id="column-regex"
                value={regex}
                onChange={(event) => setRegex(event.target.value)}
                placeholder="Optional pattern"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          ) : null}
          {showTimeOptions ? (
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="column-seconds">Include seconds</Label>
              <Switch
                id="column-seconds"
                checked={showSeconds}
                onCheckedChange={setShowSeconds}
              />
            </div>
          ) : null}
          {variant === "select" ? (
            <div className="grid gap-2">
              <Label htmlFor="column-options">Options</Label>
              <TagsInput
                value={options}
                onValueChange={setOptions}
                addOnPaste
                addOnTab
                blurBehavior="add"
                editable
                className="w-full gap-0"
                onValidate={(value) => value.trim().length > 0}
              >
                {({ value }) => (
                  <TagsInputList className="min-h-8 rounded-lg bg-card px-2 py-1.5">
                    {value.map((item) => (
                      <TagsInputItem key={item} value={item} className="rounded-full bg-muted">
                        {item}
                      </TagsInputItem>
                    ))}
                    <TagsInputInput
                      id="column-options"
                      placeholder={value.length === 0 ? "Type an option and press Enter" : "Add another"}
                    />
                  </TagsInputList>
                )}
              </TagsInput>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {isEdit ? "Save" : "Add column"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
