# CLAUDE.md — The Oracle Layer

Read `PLAN.md` fully before doing anything. It is the source of truth.
The design research is in `/docs` (six PDFs); consult them for voice and
learning-objective questions, but PLAN.md overrides them where they differ.

## How to work here
- Follow the build order in PLAN.md §9. One step per session. Stop after
  each step and say what to test in the browser.
- Two files: `index.html` (engine + styles) and `content.js` (all copy,
  cases, Oracle lines, leaks, vignettes, debrief text). Never put case
  content in the engine; never put engine logic in content.
- Vanilla HTML/CSS/JS only. No frameworks, no build step, no npm.
- Keep every timing constant in the `TIMING` object; every color in CSS
  variables.
- Buttons must be unmistakably buttons. This was the top playtest finding.
- Do not add tutorial text. The console is taught by Case 0.
- Do not show expert profiles or fit scores in the UI.
- Prefer small, testable changes over large rewrites. If a step is
  ambiguous, pick the option that ships and note the alternative in a
  comment.

## Tone rules for any copy you write
- Oracle is never a villain. Confident, warm, occasionally wrong.
- The player's identity stays ambiguous. Session IDs only.
- Consequences arrive in the student's voice. Short, specific, human.
- No lectures.
