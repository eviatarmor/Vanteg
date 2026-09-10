# Agent instructions

## Verification

Do not test the app in the browser. Do not launch Chrome, Chrome DevTools MCP, Playwright, or any other browser automation to check whether a change works.

After UI or layout changes, ask the user to look at the app and confirm. Automated tests in the repo (`npm test`, Vitest) are still fine.
