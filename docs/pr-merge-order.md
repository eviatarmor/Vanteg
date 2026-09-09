# Recommended PR merge order (frontend wave)

The first frontend wave is on `master` (#1–#15, #17–#31, #33–#34, #37, plus unique work from closed stacks **#32→#47** and **#35→#48**). Remaining open PRs all target `master`.

## Remaining independents (lowest number first)

These add unique UI work and can land in number order after a rebase onto current `master`:

| PR | Topic |
|----|--------|
| **#39** | Skip-to-content + main landmark |
| **#40** | Agents + custom credentials |
| **#41** | Keyboard shortcuts help (`?`) |
| **#43** | Appearance theme (system / light / dark) |

## Follow-ups that may duplicate landed work

Process only if they add unique remaining work; otherwise skip:

| PR | Supersedes |
|----|------------|
| **#42** | #2 workflow I/O secret-masking |
| **#44** | #3 login/signup shells |
| **#45** | #5 assistant route + history |
| **#46** | #10 Settings/Help (+ closed #16 compliance) |

## Closed stacked bases (already landed)

| Closed | Landed as |
|--------|-----------|
| #16 (on #10) | absorbed / closed with #10 |
| #32 (on #27) | **#47** |
| #35 (on #32) | **#48** |
| #36 (on #3) | closed |

## Conflict hotspots

Still serialise merges that edit:

- `packages/integrations` (catalog, OAuth, adapters)
- `client/src/features/workflows/model/` (node catalog / field controls)
- Settings / Help / auth shells (`#44`–`#46`)
