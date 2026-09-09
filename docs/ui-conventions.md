# UI conventions

Shared rules for client UI so product code and agents stay consistent.

## Secret fields

- Always use `SecretInput` from `@/components/secret-input` for passwords, API keys, tokens, client secrets, and any other secret value.
- Never use native `<input type="password">` or `Input type="password"`.
- `SecretInput` is a text input that masks with `maskSecretLast` (asterisks plus the last character), matching Data → Secrets.
- Reuse Data secrets masking helpers from `@/features/data/model/mask-secret` (`maskSecretLast`, `applySecretInput`, `SECRET_MASK`) for previews and grid cells.
- List cards may show a non-revealing placeholder (for example fixed `*****`) when length should not leak; prefer `maskSecretLast` when a displayed preview intentionally reflects length.

## Workflow In/Out ExplorerTree

- Workflow I/O variables derived from secret-sensitive config keys (`token`, `password`, `apiKey`, `clientSecret`, `Authorization`, and similar) or explicitly marked `secret: true` are tagged on `NodeVar`.
- In/Out `ExplorerTree` leaves for those vars use `icon: "secret"` and keep the `{{Node.key}}` expression hint — never raw secrets or live tokens in `outVar` defaults.
