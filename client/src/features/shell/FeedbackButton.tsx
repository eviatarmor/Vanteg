import { useState, type FormEvent } from "react"
import { MessageCircle } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Textarea } from "@workspace/ui/components/textarea"

import { addFeedback } from "./model/feedback-store"

export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) {
      return
    }
    addFeedback(trimmed)
    setText("")
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setText("")
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Feedback"
          className="h-8 gap-2 text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <MessageCircle />
          <span className="hidden sm:inline">Feedback</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <form onSubmit={submit} className="grid gap-2.5">
          <Textarea
            aria-label="Feedback"
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
            placeholder="What's working, and what isn't?"
            rows={4}
            className="min-h-24 resize-none"
          />
          <Button type="submit" disabled={text.trim() === ""}>
            Send
          </Button>
          <p className="text-xs text-muted-foreground">
            Everything is reviewed. Feedback is anonymous.
          </p>
        </form>
      </PopoverContent>
    </Popover>
  )
}
