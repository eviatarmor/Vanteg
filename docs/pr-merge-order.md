# Recommended PR merge order (frontend wave)

`master` has foundation **#1** (integrations adapter contracts + async UI states). The rest of the open frontend PR wave (~#2–#36) is still unmerged; many open PRs still target the pre-#1 tip and should be rebased onto current `master` before merge.

## Merge stacks (order matters)

Merge each stack bottom-up (base PR first):

| Stack | Order |
|-------|--------|
| Settings / Help | **#10** → **#16** |
| Auth | **#3** → **#36** |
| Resource-select | **#27** → **#32** → **#35** |

**Conflict note:** **#9** (Microsoft Teams featured connector) may conflict with **#35** (Teams resource-select wiring). Prefer merging the resource-select stack first, then rebase #9—or merge #9 early and rebase #35.

## Independent (roughly mergeable anytime)

These can land in any order once rebased onto current `master` (after #1):

**#2, #4, #5, #7, #8, #11–#15, #17–#26, #28–#34** (approx.; also nearby peers like #6 / #37 docs).

Still rebase onto `master` after each nearby merge if CI shows conflicts.

## Conflict hotspots

Expect thrash when several PRs touch the same surfaces:

- `packages/integrations` (catalog, OAuth, adapters)
- `client/.../node-catalog.ts` (workflow node / connector catalog)
- Integrations page UI (`IntegrationsPage` and related connect/dialog polish)

Serialise merges that edit those paths, or rebase frequently.

## Foundation guidance

**#1** should be on `master` before (or immediately when) merging field/schema and integrations UI PRs. If a field PR was cut before #1, **rebase it onto current `master`** rather than merging onto the old tip.

Keep this guide concise; do not treat PR numbers beyond ~#36 as part of this wave without updating this doc.
