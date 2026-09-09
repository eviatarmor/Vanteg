import { clearSession } from "../../auth/model/session"

/** Clear the mock auth session and send the user to the login shell. */
export function logout(): void {
  clearSession()
  window.location.assign("/login")
}
