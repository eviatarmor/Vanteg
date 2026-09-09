import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router"

import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Spinner } from "@workspace/ui/components/spinner"

import { SecretInput } from "@/components/secret-input"

import { hasMockSession, setSession } from "./model/session"
import { validateLogin, type FieldErrors } from "./model/validation"
import { AuthLayout } from "./ui/AuthLayout"

const MOCK_DELAY_MS = 400

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  if (hasMockSession()) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    const nextErrors = validateLogin({ email, password })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setPending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
      const trimmed = email.trim()
      setSession({
        email: trimmed,
        name: trimmed.split("@")[0] || trimmed,
      })
      navigate("/", { replace: true })
    } catch {
      setFormError("Something went wrong. Try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthLayout
      title="Log in"
      description="Sign in with your email to open your workspace."
      footer={
        <p>
          New here?{" "}
          <Link
            to="/sign-up"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form className="grid gap-4" onSubmit={onSubmit} noValidate>
        {formError ? (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            onChange={(event) => setEmail(event.target.value)}
            disabled={pending}
          />
          {errors.email ? (
            <p id="login-email-error" className="text-sm text-destructive" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="login-password">Password</Label>
          <SecretInput
            id="login-password"
            value={password}
            onValueChange={setPassword}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
            disabled={pending}
          />
          {errors.password ? (
            <p
              id="login-password-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.password}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Spinner data-icon="inline-start" />
              Signing in…
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
