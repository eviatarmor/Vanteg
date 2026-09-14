export interface MentionQuery {
  start: number
  end: number
  search: string
}

function isTokenBoundary(text: string, index: number): boolean {
  if (index <= 0) {
    return true
  }
  return /\s/.test(text[index - 1]!)
}

export function findMentionQuery(
  text: string,
  caret: number
): MentionQuery | null {
  const safeCaret = Math.max(0, Math.min(caret, text.length))
  const beforeCaret = text.slice(0, safeCaret)
  const atIndex = beforeCaret.lastIndexOf("@")
  if (atIndex < 0) {
    return null
  }
  if (!isTokenBoundary(text, atIndex)) {
    return null
  }
  const search = beforeCaret.slice(atIndex + 1)
  if (/\s/.test(search)) {
    return null
  }
  let end = safeCaret
  while (end < text.length && !/\s/.test(text[end]!)) {
    end += 1
  }
  return {
    start: atIndex,
    end,
    search,
  }
}
