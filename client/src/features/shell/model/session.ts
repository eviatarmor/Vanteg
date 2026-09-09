import { clearSession } from "../../auth/model/session"

export function logout(): void {
  if (!clearSession()) {
    return
  }
  window.location.assign("/login")
}
