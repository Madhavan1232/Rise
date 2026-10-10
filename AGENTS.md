# Agent Working Instructions - Rise Project

## UI Verification and Browser Automation Policy

Do **NOT** use Playwright, browser automation, screenshots, visual/UI tests, or automated UI verification by default.

### Guidelines for UI Changes:
- Make only the requested code, CSS, and component changes.
- Run build (`npm run build`), type-check, and lint checks only when relevant and available.
- Report the files changed and any commands run.
- Do not launch Playwright or add Playwright tests.
- Do not state "I verified the UI visually" unless the user explicitly requested Playwright or browser automation.
- The user will manually inspect the UI in their browser.

### Explicit Triggers for Browser Automation:
Only use Playwright or browser automation if the user explicitly includes one of the following phrases in their request:
- "Use Playwright"
- "Verify with Playwright"
- "Test this UI using browser automation"
- "Take a screenshot and verify it"
