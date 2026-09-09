import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router"

import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Spinner } from "@workspace/ui/components/spinner"

import { SecretInput } from "@/components/secret-input"

import { hasMockSession, setSession } from "./model/session"
import { validateSignUp, type FieldErrors } from "./model/validation"
import { AuthLayout } from "./ui/AuthLayout"

const MOCK_DELAY_MS = 400

export function SignUpPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  if (hasMockSession()) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    const nextErrors = validateSignUp({
      name,
      email,
      password,
      confirmPassword,
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setPending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
      setSession({
        email: email.trim(),
        name: name.trim(),
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
      title="Create account"
      description="Mock sign-up — no identity provider yet."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Log in
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
          <Label htmlFor="signup-name">Name</Label>
          <Input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "signup-name-error" : undefined}
            onChange={(event) => setName(event.target.value)}
            disabled={pending}
          />
          {errors.name ? (
            <p id="signup-name-error" className="text-sm text-destructive" role="alert">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            onChange={(event) => setEmail(event.target.value)}
            disabled={pending}
          />
          {errors.email ? (
            <p id="signup-email-error" className="text-sm text-destructive" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="signup-password">Password</Label>
          <SecretInput
            id="signup-password"
            value={password}
            onValueChange={setPassword}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "signup-password-error" : undefined
            }
            disabled={pending}
          />
          {errors.password ? (
            <p
              id="signup-password-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.password}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="signup-confirm-password">Confirm password</Label>
          <SecretInput
            id="signup-confirm-password"
            value={confirmPassword}
            onValueChange={setConfirmPassword}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword
                ? "signup-confirm-password-error"
                : undefined
            }
            disabled={pending}
          />
          {errors.confirmPassword ? (
            <p
              id="signup-confirm-password-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.confirmPassword}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Spinner data-icon="inline-start" />
              Creating account…
            </>
          ) : (
            "Sign up"
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
