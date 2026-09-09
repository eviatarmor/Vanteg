import * as React from "react"

const OVERFLOW_EPSILON = 1

export function useScrollOverflow<T extends HTMLElement = HTMLElement>() {
  const [node, setNode] = React.useState<T | null>(null)
  const [canScrollDown, setCanScrollDown] = React.useState(false)

  React.useLayoutEffect(() => {
    if (!node) {
      setCanScrollDown(false)
      return
    }

    const update = () => {
      const next =
        node.scrollHeight - node.scrollTop - node.clientHeight > OVERFLOW_EPSILON
      setCanScrollDown((current) => (current === next ? current : next))
    }

    update()
    node.addEventListener("scroll", update, { passive: true })
    const resize = new ResizeObserver(update)
    resize.observe(node)
    const mutations = new MutationObserver(update)
    mutations.observe(node, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => {
      node.removeEventListener("scroll", update)
      resize.disconnect()
      mutations.disconnect()
    }
  }, [node])

  return { ref: setNode, canScrollDown }
}
