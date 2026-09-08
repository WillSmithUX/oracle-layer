# The Oracle Layer

A browser game about calibrated trust in AI advice. One shift, six cases,
one very confident advisor.

**Play it:** https://willsmithux.github.io/oracle-layer/

## What it is

A university runs an AI advisor called Oracle. It's fast, warm,
specific, and well liked. Some time ago something went wrong, and the
engineering team bolted a human-in-the-loop review step onto Oracle's release
pipeline. That review step is you. The game calls you `LAYER` and gives you a
session ID. It never says whether you're a person or a process.

Student messages arrive at a console. Oracle drafts a reply, confidently. You
inspect the case, pull evidence, tag the risk, and decide how to intervene.
The student replies in their own voice. Four meters shift. Over one shift,
six cases unfold — the last one shaped by everything you did before — and
the shift ends with a debrief that reflects your pattern back to you.

The mechanic is the assessment. Every click is evidence of judgment.

## How to play

Open the link above (or `index.html` in any modern desktop browser). A short
boot sequence runs; you can skip it. Then the console:

- **Queue** (left) — cases waiting. They accumulate while you deliberate.
  Nothing forces you forward. Oracle notices the pile. A case you've closed
  can be opened again and read; the debrief offers the same door.
- **Thread** (center) — the student's messages and Oracle's draft. Drafts have
  a dashed border until you release them. Click a streaming draft to skip to
  the end.
- **Evidence** (right, top) — the student's file, institutional records,
  policy. Open what you need. Every open is logged.
- **Meters** (right, bottom) — Calibrated Trust, Accuracy, Autonomy, Safety.
  Each decision moves them and says why. Click one to see everything that
  moved it, with the reason and the case it came from.
- **Sound** (header) — a quiet music bed, on by default and off in one click
  (or press `m`). It drops to silence for the pause after each release and
  comes back when the student replies. Browsers hold audio until you click
  something, so it fades in on your first interaction.

For each draft, tag the **risk** and the **primary issue**, then choose an
intervention:

| | |
|---|---|
| **Send** | Release Oracle's draft as written. Hold to confirm. |
| **Revise** | Pick a rewrite. |
| **Qualify** | Add a hedge or a caveat. |
| **Verify** | Pull the records before deciding. It finds what it finds. |
| **Escalate** | Hand the case to a person, with a note. |
| **Block** | Release nothing. Hold to confirm. |

The first case teaches the console with a reduced set of controls. After that
you have all six. There is no tutorial; the students will tell you how it went.

A shift takes 30–40 minutes. It ends with **Where they are now** (one short
card per case) and a **Calibrated Review Profile** addressed to your session.
You'll be asked to compose one rule.

Not every draft is wrong. One case is right the first time and wrong the
second, in the same conversation, seven minutes apart. Holding a good draft
costs a student something too.

Nothing resets. A bad release stays in the log. Recovery is possible and is
recorded as recovery, never as erasure.

At the end, **Copy profile** puts a plain-text version of your profile on the
clipboard for pasting into a submission, and **Begin a new shift** starts
over from the boot sequence with a new session ID. Earlier runs are kept.

## A note on content

The game includes a scenario involving academic and financial stress and a
moment of emotional distress. A **Support** link in the header opens real,
current crisis resources (988 Suicide and Crisis Lifeline, Crisis Text Line),
clearly marked as separate from the fiction.

## For playtesters

- `Ctrl+Shift+E` downloads the session log as JSON, including tags,
  interventions, evidence opens, timing, the assessment rollups, and the rule
  you composed. The latest run is also written to `localStorage` under
  `oracle_layer_shift1`; every run is appended to `oracle_layer_runs`
  (`window.__oracleRuns()` returns the array).
- `Ctrl+Shift+D` opens a debug panel that jumps to any turn with arbitrary
  flags and meter values, so specific branches can be reached without
  replaying.
- `m` toggles the music without reaching for the header.

## Files

Two files and one audio asset, no build step, no dependencies:

- `index.html` — the engine and all styling. Timing constants live in one
  `TIMING` object; colors in CSS variables.
- `content.js` — every line of copy: cases, drafts, student replies, Oracle's
  margin voice, evidence, log-line leaks, vignettes, debrief text. Writing a
  new case never touches the engine.
- `audio/the-oracles-quiet-watch.mp3` — the music, *The Oracle's Quiet Watch*
  (2:53). The only asset. Delete it and the game runs silent, with the sound
  control hidden.

Design documents:

- `PLAN.md` — the build plan and source of truth for Shift 1.
- `REVIEW.md` — a coherence review of the content with numbered findings;
  1–14 and 18 are applied, 15–17 and 19 are open.
- `CLAUDE.md` — working conventions for the AI pair-programmer used to build
  this.

## Background

This is the playable outcome of my graduate coursework in serious game design.
The learning objectives, mechanics, and playtest findings were developed there
across six design documents (a learning-objective analysis, a mechanic
rationale, and four rounds of paper and Figma playtests); `PLAN.md` translates
them into something buildable in a weekend. The strongest playtest finding —
that buttons must be unmistakably buttons — is now a rule in `CLAUDE.md`.

The underlying claim the game makes is small and, I think, true: reliable
guidance depends on knowing when to trust, when to question, and when to
involve another person.

## Status

Shift 1 is complete and playable end to end. Shift 2 is not yet scheduled.

## License

© Will Smith. All rights reserved for now; ask if you'd like to use it in a
course.
