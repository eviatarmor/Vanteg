import Editor from "@monaco-editor/react"

import { Textarea } from "@workspace/ui/components/textarea"

export function CodeField({
  id,
  value,
  language = "javascript",
  onChange,
}: {
  id: string
  value: string
  language?: "javascript" | "json"
  onChange: (value: string) => void
}) {
  if (import.meta.env.MODE === "test") {
    return (
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-40 font-mono text-xs"
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-input">
      <Editor
        height="220px"
        language={language}
        value={value}
        theme="light"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          tabSize: 2,
          padding: { top: 8, bottom: 8 },
        }}
        onChange={(next) => onChange(next ?? "")}
      />
    </div>
  )
}
