import { useState, type FormEvent } from "react"
import { Link, Navigate } from "react-router"

import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Spinner } from "@workspace/ui/components/spinner"

import { SecretInput } from "@/components/secret-input"

import { hasMockSession, setSession } from "./model/session"
import { useMockAuthSubmit } from "./model/use-mock-auth-submit"
import { validateSignUp, type FieldErrors } from "./model/validation"
import { AuthLayout } from "./ui/AuthLayout"

function errorDescribedBy(id: string, error?: string) {
  if (!error) {
    return undefined
  }
  return id
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null
  }
  return (
    <p id={id} className="text-sm text-destructive" role="alert">
      {message}
    </p>
  )
}

function FormAlert({ message }: { message: string | null }) {
  if (!message) {
    return null
  }
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

function LoginSwitch({ pending }: { pending: boolean }) {
  if (pending) {
    return <span className="font-medium text-muted-foreground">Log in</span>
  }
  return (
    <Link
      to="/login"
      className="font-medium text-foreground underline-offset-4 hover:underline"
    >
      Log in
    </Link>
  )
}

function SignUpSubmitLabel({ pending }: { pending: boolean }) {
  if (!pending) {
    return "Sign up"
  }
  return (
    <>
      <Spinner data-icon="inline-start" />
      Creating account…
    </>
  )
}

async function submitSignUpForm({
  event,
  name,
  email,
  password,
  confirmPassword,
  setFormError,
  setErrors,
  setPending,
  waitThenFinish,
}: {
  event: FormEvent<HTMLFormElement>
  name: string
  email: string
  password: string
  confirmPassword: string
  setFormError: (value: string | null) => void
  setErrors: (value: FieldErrors) => void
  setPending: (value: boolean) => void
  waitThenFinish: (
    finish: () => boolean
  ) => Promise<"ok" | "cancelled" | "failed">
}) {
  event.preventDefault()
  setFormError(null)
  const nextErrors = validateSignUp({
    name,
    email,
    password,
    confirmPassword,
  })
  setErrors(nextErrors)
  if (Object.keys(nextErrors).length > 0) {
    return
  }

  setPending(true)
  const result = await waitThenFinish(() =>
    setSession({
      email: email.trim(),
      name: name.trim(),
    })
  )
  if (result === "failed") {
    setFormError("Something went wrong. Try again.")
  }
  if (result !== "cancelled") {
    setPending(false)
  }
}

function SignUpFields({
  name,
  email,
  password,
  confirmPassword,
  errors,
  pending,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
}: {
  name: string
  email: string
  password: string
  confirmPassword: string
  errors: FieldErrors
  pending: boolean
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
}) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="signup-name">Name</Label>
        <Input
          id="signup-name"
          type="text"
          autoComplete="name"
          value={name}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errorDescribedBy("signup-name-error", errors.name)}
          onChange={(event) => onNameChange(event.target.value)}
          disabled={pending}
        />
        <FieldError id="signup-name-error" message={errors.name} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errorDescribedBy(
            "signup-email-error",
            errors.email
          )}
          onChange={(event) => onEmailChange(event.target.value)}
          disabled={pending}
        />
        <FieldError id="signup-email-error" message={errors.email} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-password">Password</Label>
        <SecretInput
          id="signup-password"
          value={password}
          onValueChange={onPasswordChange}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errorDescribedBy(
            "signup-password-error",
            errors.password
          )}
          disabled={pending}
        />
        <FieldError id="signup-password-error" message={errors.password} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-confirm-password">Confirm password</Label>
        <SecretInput
          id="signup-confirm-password"
          value={confirmPassword}
          onValueChange={onConfirmPasswordChange}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={errorDescribedBy(
            "signup-confirm-password-error",
            errors.confirmPassword
          )}
          disabled={pending}
        />
        <FieldError
          id="signup-confirm-password-error"
          message={errors.confirmPassword}
        />
      </div>
    </>
  )
}

export function SignUpPage() {
  const { returnTo, waitThenFinish } = useMockAuthSubmit()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  if (hasMockSession()) {
    return <Navigate to={returnTo} replace />
  }

  return (
    <AuthLayout
      title="Create account"
      description="Mock sign-up — no identity provider yet."
      footer={
        <p>
          Already have an account? <LoginSwitch pending={pending} />
        </p>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={(event) =>
          void submitSignUpForm({
            event,
            name,
            email,
            password,
            confirmPassword,
            setFormError,
            setErrors,
            setPending,
            waitThenFinish,
          })
        }
        noValidate
      >
        <FormAlert message={formError} />
        <SignUpFields
          name={name}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          errors={errors}
          pending={pending}
          onNameChange={setName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
        />
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          <SignUpSubmitLabel pending={pending} />
        </Button>
      </form>
    </AuthLayout>
  )
}
