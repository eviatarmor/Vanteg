import { useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router"

import { returnPathFromState } from "./session"

const MOCK_DELAY_MS = 400

export function useMockAuthSubmit() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = returnPathFromState(location.state)
  const cancelledRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    cancelledRef.current = false
    return () => {
      cancelledRef.current = true
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  async function waitThenFinish(
    finish: () => boolean
  ): Promise<"ok" | "cancelled" | "failed"> {
    await new Promise<void>((resolve) => {
      timerRef.current = setTimeout(resolve, MOCK_DELAY_MS)
    })
    if (cancelledRef.current) {
      return "cancelled"
    }
    if (!finish()) {
      return "failed"
    }
    navigate(returnTo, { replace: true })
    return "ok"
  }

  return { returnTo, waitThenFinish }
}
