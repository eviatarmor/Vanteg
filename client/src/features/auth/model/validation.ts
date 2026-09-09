const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type LoginValues = {
  email: string
  password: string
}

export type SignUpValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export type FieldErrors = Partial<Record<string, string>>

export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim()
  if (!trimmed) return "Email is required"
  if (!EMAIL_RE.test(trimmed)) return "Enter a valid email address"
  return undefined
}

export function validateLogin(values: LoginValues): FieldErrors {
  const errors: FieldErrors = {}
  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError
  if (!values.password) errors.password = "Password is required"
  return errors
}

export function validateSignUp(values: SignUpValues): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.name.trim()) errors.name = "Name is required"
  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError
  if (!values.password) errors.password = "Password is required"
  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your password"
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match"
  }
  return errors
}
