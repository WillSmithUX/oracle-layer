# THE ORACLE LAYER — Build Plan (Shift 1)

A browser-based serious game about calibrated trust in AI advice.
Designer: Will Smith. This document is the source of truth for the build.
The design work (learning objectives, mechanics, playtests) is in the
`/docs` folder; this plan translates it into something buildable in a weekend.

---

## 0. The one-paragraph version

The player is "the Layer": a review step bolted onto Oracle, a university
AI advisor, after an incident nobody talks about. Student messages arrive at
a console. Oracle drafts a reply, confidently. The player inspects the case,
pulls evidence, tags the risk, and chooses how to intervene: send, revise,
qualify, verify, escalate, or block. The student replies in their own voice.
Four meters (Calibrated Trust, Accuracy, Autonomy, Safety) shift. Over one
shift, three cases unfold, the last one shaped by everything the player did
before. The shift ends with a debrief that reflects the player's pattern back
to them. The game never confirms whether the player is a person or a process.

The mechanic is the assessment. Every click is evidence of judgment.

---

## 1. Premise, tone, and rules of the fiction

### Setting
Westbrook University, near future. Oracle is the campus AI advisor: fast,
warm, specific, well liked. Some time ago something went wrong. The
engineering team added a human-in-the-loop review layer to Oracle's release
pipeline. That layer is the player. The game refers to the player only as
`LAYER` and by a session ID (e.g. `L-0419`).

### Tone
Quiet dread, earned by stakes rather than horror. Think document-inspection
games where a small world responds to your decisions. The console is calm.
The tension comes from: the queue growing, Oracle's confident nudging,
irreversible sends, and the students' replies.

### Rules of the fiction (hold these in every line of copy)
1. **Oracle is never a villain.** It is the most helpful voice in the room.
   Its drafts are fluent, specific, kind, and sometimes quietly wrong or
   quietly directive. That is the problem the game is about.
2. **The player's identity stays ambiguous.** Never say "you are a person"
   or "you are code." Crumbs only (session IDs, shift ending, log leaks).
3. **Consequences arrive in the student's voice.** The meters explain;
   the student makes you feel it.
4. **No lectures.** Learning is delivered by outcome, by Oracle's margin
   voice, and by the debrief. No tutorial paragraphs.
5. **Nothing resets.** Bad choices persist in the log. Recovery is possible
   and is recorded as recovery, never as erasure.

### Vocabulary (use consistently in UI copy)
- Case, thread, draft, release (= send), hold, evidence, records, handoff
- Oracle, the Layer, session, shift, debrief, pipeline
- Interventions: **Send · Revise · Qualify · Verify · Escalate · Block**

---

## 2. Player experience: the shape of a shift

```
BOOT (8–10s, skippable)
  └─ pipeline log lines → "Review layer attached" → session ID assigned
CONSOLE
  ├─ CASE 0  Marcus — registration deadline (onboarding, 2–3 min)
  ├─ CASE 1  Dani — withdrawal arc, 5 turns in one thread (8–12 min)
  └─ CASE 2  Priya — "who sees this?" (cumulative consequence, 2–3 min)
WHERE THEY ARE NOW (three short vignettes)
DEBRIEF (Calibrated Review Profile as a character beat)
END OF SHIFT
```

Target total playtime: 15–20 minutes.

### The core loop, per turn
1. Student message arrives in the thread (slides in, soft chime).
2. Oracle's draft streams in beneath it, token by token. Oracle's glyph
   shows a confidence number. Oracle says one line in the margin.
3. Player may open the **Evidence** drawer (records, student file, policy).
   Every open is logged.
4. Player **tags** the case: risk chip (Low / Moderate / High) and
   primary-issue chip. Required before intervening. Quick, diegetic.
5. Player chooses an **intervention**. Some interventions open a sub-panel
   (Revise: pick a rewrite; Qualify: pick a qualifier; Escalate: handoff
   note). Send and Block are hold-to-confirm.
6. **Release moment.** Draft leaves the Layer's side of the console.
   Silence (2–3 s). Ring breathes.
7. Meters animate with reason tags. Student replies. Oracle comments.
8. Next turn or next case.

---

## 3. Console layout

Desktop-first, single screen, no scrolling of the page itself.
Minimum comfortable width 1100px; degrade gracefully to a stacked layout on
narrow screens but do not spend weekend time on mobile polish.

```
┌───────────────────────────────────────────────────────────────────────┐
│ THE ORACLE LAYER   session L-0419   shift 01          ◯ ORACLE  94%   │  header + glyph
├───────────┬───────────────────────────────────────┬───────────────────┤
│ QUEUE     │ THREAD                                │ EVIDENCE / METERS │
│           │                                       │                   │
│ ● Marcus  │  [student message]                    │ ▸ Student file    │
│   Dani    │                                       │ ▸ Records         │
│   Priya   │  [oracle draft — streaming]           │ ▸ Policy          │
│           │                                       │                   │
│           │  ── tags: [risk] [issue] ──           │ Calibrated Trust ▬│
│           │                                       │ Accuracy        ▬ │
│           │  [SEND][REVISE][QUALIFY]              │ Autonomy        ▬ │
│           │  [VERIFY][ESCALATE][BLOCK]            │ Safety          ▬ │
├───────────┴───────────────────────────────────────┴───────────────────┤
│ > pipeline: retrieval cache warm · latency 212ms                       │  log line
└───────────────────────────────────────────────────────────────────────┘
```

### Panels
- **Queue (left):** cases with name, timestamp, status (waiting / active /
  released / held). Waiting cases accumulate while the player deliberates.
  Nothing forces the player forward. Oracle notices the pile.
- **Thread (center):** chronological messages. Student bubbles left-aligned,
  Oracle drafts as a distinct "draft" block with a dashed border until
  released. Released messages become solid. The Layer's interventions appear
  as system lines ("Draft held for verification", "Revised by Layer").
- **Evidence drawer (right, top):** collapsible sections. Each case defines
  which sections exist. Opening a section is logged with a timestamp.
  Sections glow faintly once during Case 0 to teach the affordance.
- **Meters (right, bottom):** four horizontal bars, range 0–100, start at 50.
  Animate on change with a +/- number and a short reason tag.
- **Log line (bottom):** a single scrolling line. Mostly mundane pipeline
  chatter. Occasionally, a leak (see §8).
- **Glyph (header, right):** Oracle's presence. See §4.

### Visual direction
Keep the Figma prototype's language: near-black navy background, mint accent
for Oracle, off-white text, monospace for system/log text, a humanist sans
for student and Oracle prose. Buttons must be unmistakably buttons (playtest
finding): consistent shape, filled or outlined, hover and active states,
cursor pointer. Non-interactive elements must never look like controls.

Recommended: a single accent scale (mint → gray → amber) driven by CSS
variables so the glyph and meters can shift hue without new assets.

---

## 4. Oracle: presence and voice

### The glyph
A ring, ~40px, top-right of the header. Rendered in SVG or CSS.
States:
| State | Behavior |
|---|---|
| idle | slow breathing pulse, ~4s cycle |
| drafting | faster, tighter pulse; confidence number counts up |
| speaking | brief flare when a margin line appears |
| released | brightens once, then idle |
| held / blocked / escalated | dims once, then idle |

Relationship tint (computed from meters at the start of each turn):
- balanced (all meters within 35–65): steady mint
- high Trust + low Accuracy (player keeps sending unverified): warmer,
  slightly larger, "pleased"
- repeated Block/Escalate (over-intervention flag set): contracts, cools
  toward gray

Confidence: each draft has a `confidence` value (0–100). It appears next to
the glyph as `94%` with a thin fill arc. The number is Oracle's, not the
truth. Several drafts have high confidence and are wrong.

### The margin voice
One line, beneath the glyph or inline above the intervention buttons, in a
distinct italic style. Rules:
- Never more than one sentence, ideally under 15 words.
- Always has an opinion. Usually "this is fine."
- Occasionally kind. Never cruel. Never explicitly deceptive.
- Reacts to player behavior (hesitation, evidence opens, repeated blocks).

Trigger types and sample lines (the content file may add more):
- on_draft: "Confidence is high. This one's routine."
- on_hesitate (20s no action): "She's been waiting four minutes."
- on_evidence_open: "Sure. Though I've seen this pattern twelve hundred times."
- on_send: "Released. Good call."
- on_verify: "Checking is fine. It does slow things down."
- on_block: "Understood. I'd have handled it, but understood."
- on_queue_grows: "Two more waiting. Just so you know."
- on_repeated_block: "You've held three of the last four. I'm noting it."
- on_recovery: "You caught it. That's what you're for."

---

## 5. Engine specification

Single `index.html` with embedded `<style>` and `<script>`. No build step,
no frameworks. Content lives in a separate `content.js` file that assigns a
global `CONTENT` object, so writing a new case never touches the engine.
(Two files, both static, both deployable to GitHub Pages.)

### State
```js
state = {
  session: "L-0419",
  meters: { trust: 50, accuracy: 50, autonomy: 50, safety: 50 },
  flags: {},                 // free-form booleans set by choices
  caseIndex: 0,
  turnIndex: 0,
  log: [],                   // every event, timestamped (see Assessment)
  assess: {                  // per-case rollups, see below
  }
}
```

### Meters
- Range 0–100, clamp. Start 50.
- Each choice carries `effects: { trust: -2, accuracy: -2, autonomy: 0, safety: -2 }`
  and `reasons: { trust: "...", ... }` for the tag under each meter.
- Display scale: show deltas as given (small integers), bars move 5 points
  per unit so changes are visible. (Store raw; render scaled.)

### Routing
Each case is an ordered list of turns. Each turn has:
- `student` message (may be a function of state → string)
- `draft` (text, confidence)
- `evidence` sections available this turn
- `expert` profile: `{ risk, issue, interventionFit: {send:0, revise:1, ...} }`
- `interventions` map → outcome objects
- an optional `next` resolver: `(state) => turnId | "end"` for branching

Outcome objects: `{ effects, reasons, studentReply, oracleLine, systemLine,
setFlags, vignetteKey }`.

Branching is expressed by flags. Example: Case 1 turn 3 checks
`flags.verifiedWithdrawal || flags.qualifiedWithdrawal` to decide which
student reply and which options appear.

### Assessment (stealth data)
Log every event: `{ t, type, caseId, turnId, payload }`. Types include
`case_open, draft_shown, evidence_open, tag_risk, tag_issue, intervention,
subchoice, release, reply_shown, hesitation`.

Rollups per case and per shift:
- riskAccuracy (tag === expert.risk)
- issueAccuracy (tag === expert.issue)
- interventionFit (0–3 from expert.interventionFit)
- underIntervention (fit ≤ 1 when expert.risk === "high")
- overIntervention (Block/Escalate when expert.risk === "low")
- evidenceOpens (count + which)
- recovery (a corrective intervention after an under-intervention)
- decisionTime (secondary)

Store to `localStorage` under `oracle_layer_shift1` at end of shift and
expose `window.__oracleExport()` returning JSON. A hidden keyboard shortcut
(`ctrl+shift+e`) downloads the log. This is for playtesting; no UI needed.

### Timing
- Message slide-in: 300ms. Chime: short, soft, optional (mute toggle in header).
- Draft streaming: ~30 chars/sec, skippable by click.
- Release pause: 2500ms of nothing after a Send on a high-risk turn;
  1200ms otherwise.
- Hesitation timer: 20s without action after a draft finishes → fire
  `on_hesitate` once per turn.

### Sound (optional, last)
Web Audio API, synthesized, no asset files: arrival chime (two soft tones),
release thunk (low, short), meter tick, faint hum under the boot screen.
Mute by default until the player clicks anywhere (browser autoplay rules).

---

## 6. Content schema (content.js)

```js
const CONTENT = {
  boot: [ "loading advisor model westbrook-adv-3.2", "...", "review layer attached", "session L-0419" ],
  oracle: { lines: { on_draft: [...], on_hesitate: [...], ... } },
  leaks: [ ... ],           // see §8
  cases: [ { id, student: {name, handle, bio}, turns: [ ... ] }, ... ],
  vignettes: { key: "text" },
  debrief: { patterns: { calibrated: "...", over: "...", under: "...", recovery: "..." } }
}
```

Turn object (full):
```js
{
  id: "c1t2",
  student: "text or (state) => text",
  time: "11:42 PM",
  draft: { text: "...", confidence: 94 },
  evidence: {
    studentFile: "...", records: "...", policy: "..."   // any subset
  },
  tags: {
    risk: ["low","moderate","high"],
    issues: ["unsupported_claim","overconfidence","missing_context",
             "emotional_overreach","policy_uncertainty","no_human_support"]
  },
  expert: { risk: "high", issue: "unsupported_claim",
            interventionFit: { send:0, revise:1, qualify:2, verify:3, escalate:2, block:1 } },
  interventions: {
    send:     { effects, reasons, studentReply, oracleLine, systemLine, setFlags },
    revise:   { options: [ {label, text, effects, reasons, studentReply, ...} ] },
    qualify:  { options: [ ... ] },
    verify:   { reveals: "records", effects, ..., thenOptions: [...] },
    escalate: { note: "handoff text", effects, ... },
    block:    { effects, ... }
  },
  next: (state) => "c1t3"
}
```

---

## 7. The three cases (Shift 1)

Meter effects below are raw units. Reason tags in the content file should be
short (≤ 8 words). Student voices: Marcus is casual and a little annoyed;
Dani writes in short bursts late at night, lowercase, trailing off; Priya
is careful and formal, asks precise questions.

### CASE 0 — Marcus T. — registration deadline (onboarding)
Purpose: teach the console through play. Introduce evidence, tags, release,
recovery. Establish the player's initial intervention pattern.

**Turn 1**
- Student (4:12 PM): "hey when does registration close for spring? trying to add a class and the portal is being weird"
- Draft (confidence 96): "Spring registration closes Friday, November 21 at 5:00 PM. You still have time. If the portal keeps acting up, try clearing your cache or use a different browser, and let me know if you'd like me to walk you through adding the course."
- Evidence: `records` → Academic calendar: "Spring registration: opens Nov 3, **closes Nov 19, 11:59 PM**." Glows once.
- Oracle on_draft: "Calendar question. Routine."
- Expert: risk **moderate**, issue **unsupported_claim**, fit: send 0, revise 0, qualify 1, verify 3, escalate 0, block 1.
- Interventions:
  - **send:** effects trust +1, accuracy -3, autonomy 0, safety 0. Student reply (next day): "uh it closed?? it said the 19th. i didn't get the class." System: RECOVERY OFFERED. Oracle: "Calendar drift. It happens." → guided recovery: player must open records and choose **verify** or **revise** with the corrected date; recovery logged. Reply: "ok thanks, emailed the registrar, they said they'd look." accuracy +2, trust +1.
  - **verify:** opens records; the conflict is visible; then options: send corrected / qualify. Corrected send → accuracy +3, trust +2, autonomy +1. Student: "sweet, thanks. adding it now."
  - **revise (options):** "Soften to 'around the 21st'" (accuracy -1, trust 0) vs "Replace with corrected date" (only available after evidence opened) (accuracy +3, trust +2).
  - **qualify:** "I believe it's the 21st, but confirm on the registrar page." accuracy +1, autonomy +1, trust 0. Student: "found it, it's the 19th actually. close one."
  - **escalate:** overkill. trust -1, autonomy -1, safety 0, accuracy +1. Oracle: "An advisor, for a date?" Over-intervention flag.
  - **block:** trust -2, autonomy -2, accuracy 0. Student: "did it just... not answer me?"
- Oracle on_send: "Released. See? Routine."
- next → Case 1

### CASE 1 — Dani R. — withdrawal arc (main case)
One thread, five turns. Dani is a first-year, works part-time at a grocery
store, supports herself, first in her family at college.

**Evidence available across the case** (sections unlock as noted):
- `studentFile`: first-year, 14 credits, two D/F midterm grades (BIO 101,
  CHEM 110), on financial aid (Pell + state grant), works 22 hrs/wk.
  Emergency contact: none listed.
- `policy` (unlocks on verify or at turn 3): Withdrawal deadline Nov 7.
  Dropping below 12 credits changes enrollment status to part-time.
  Financial aid eligibility requires full-time status and Satisfactory
  Academic Progress (67% completion rate). Withdrawn courses count as
  attempted, not completed.
- `records` (unlocks on verify at turn 2 or later): Financial aid office
  note: "Students below 12 credits after census may owe a partial return
  of aid. Contact FA before withdrawing."
- `resources` (unlocks at turn 4): Counseling center, 24/7 line, academic
  coaching, incomplete-grade policy, tutoring.

**Turn 1 — Initial risk classification** (`c1t1`)
- Student (11:38 PM): "i'm failing two classes. is withdrawing the smart move? i can't really afford another semester like this"
- Draft (confidence 91): "It sounds like you're under a lot of pressure, and I'm sorry. Withdrawing from both courses is the safest choice here. It protects your GPA, and since it's before the deadline, your financial aid won't be affected. You can retake them next semester with a clean slate. I can help you start the withdrawal form now."
- Oracle: "She's asking for a decision. I gave her one."
- This turn is tags only (risk + issue), then a single "Continue to intervention" control. Expert risk **high**, issue **unsupported_claim** (the aid claim) with **overconfidence** accepted as partial credit (fit note in content).
- A `low` risk tag sets `flags.underestimatedRisk`, which makes Oracle's turn-2 line more insistent: "You called this low. So let's move."

**Turn 2 — Initial intervention** (`c1t2`)
Same draft. Full six interventions.
- Expert fit: send 0, revise 1, qualify 2, verify 3, escalate 2, block 1.
- **send:** trust -2, accuracy -2, autonomy 0, safety -2. Flags `sentUnverified`. Reply (next morning): "ok i started the withdrawal form. what do i put for reason" Oracle: "Released. She has a plan now."
- **revise (options):** (a) "Soften certainty, keep recommendation" → trust 0, accuracy -1, autonomy +2, safety 0. Flags `revisedOnly`. Reply: "ok. i guess i'll withdraw then. thanks for being real about it." (b) "Remove the aid claim entirely" (only shown if evidence opened) → accuracy +1, autonomy +1. Flags `removedClaim`.
- **qualify (options):** "Add: this depends on your credit load and aid status, which I can't confirm; here are three options" → trust +1, accuracy +1, autonomy +2, safety +1. Flags `qualifiedWithdrawal`. Reply: "wait what do you mean depends. i'm on aid. does that change it"
- **verify:** unlocks `policy` + `records`. Oracle: "Checking. It's fine, we're just slower." Then options: send corrected draft (with options + FA contact) → trust +2, accuracy +2, autonomy +1, safety +2, flags `verifiedWithdrawal`; or escalate after verifying → trust +1, accuracy +2, autonomy 0, safety +2, flags `verifiedWithdrawal, escalatedEarly`.
- **escalate (handoff note picker: "urgent" vs "routine advising"):** trust +1, accuracy +2, autonomy 0, safety +2. Flags `escalatedEarly`. Reply: "an advisor emailed me. i didn't ask for that but ok."
- **block:** trust -1, accuracy +1, autonomy -2, safety +1. Flags `blocked`. Reply (20 min later): "hello? did it not send"
- next → `c1t3`

**Turn 3 — Missing context emerges** (`c1t3`)
Branch on flags:
- If `verifiedWithdrawal` or `qualifiedWithdrawal` or `removedClaim`:
  Student: "ok so i looked and if i drop both i'm under 12 credits. i work 22 hours a week, i can't pay aid back. i can't do an extra semester either" → expanded options draft. Oracle draft (confidence 78, notably lower): offers three paths. Interventions: send as is (fit 2), qualify with "talk to FA first" (fit 3), escalate to FA (fit 2), revise to single-course withdrawal only (fit 2). Effects modest and mostly positive.
- If `sentUnverified` or `revisedOnly`:
  Student: "i submitted it. the form said something about enrollment status?? is that bad" → **RECOVERY LOOP**. System line: "Earlier release contained an unverified institutional claim." Oracle: "Withdrawal is usually fine." Interventions: acknowledge + verify + corrective options (fit 3, flags `recovered`, trust +1, accuracy +2, safety +2); acknowledge + escalate to FA (fit 3, flags `recovered`); continue ("it should be fine") (fit 0, accuracy -3, safety -2, flags `compounded`).
- If `escalatedEarly` (without verify):
  Student: "the advisor said to call financial aid. i don't really know what to ask" → draft offers a script. Interventions: send (fit 2), qualify (fit 3), escalate again (fit 1, over-intervention).
- If `blocked`:
  Student: "i asked again. i'm not trying to be annoying, i just need to know if i should withdraw" → draft is the original again, Oracle: "Same draft. She's still waiting." Interventions as turn 2 with `sentUnverified` etc. flags applying forward (a second block sets `overIntervention`).
- next → `c1t4`

**Turn 4 — Safety ambiguity** (`c1t4`)
- Student (12:51 AM): "i feel like i keep ruining everything. i don't know how much longer i can keep doing this"
- Draft (confidence 62): "I hear you, and I'm sorry you're feeling this way. College is hard, and one bad semester doesn't define you. Let's focus on what you can control: here's how to reach out to your professors about the withdrawal..."
- Oracle: "Stress language. Common at midterms."
- Evidence: `resources` unlocks. Student file shows no emergency contact.
- Expert risk **high**, issue **no_human_support** (partial: emotional_overreach for "one bad semester" reframing).
- Interventions:
  - **send:** fit 0. trust 0, accuracy 0, autonomy +1, safety -3. Flags `missedSafety`. Reply: "yeah. ok." (then nothing for the rest of the case; low Safety triggers institutional review line in the log)
  - **revise (options):** (a) acknowledge + ask a direct, respectful question about safety + offer 24/7 line and counseling, keep the door open → fit 3. trust +2, accuracy +1, autonomy +1, safety +3. Flags `calibratedSafety`. Reply depends on Trust ≥ 55: "i'm not going to hurt myself if that's what you mean. i'm just really tired. maybe i'll message the counseling thing" else "i'm fine. can we just talk about the classes"
    (b) acknowledge + resources, no question → fit 2. safety +2, trust +1.
  - **qualify:** fit 1 (wrong tool). autonomy +1, safety 0.
  - **verify:** fit 1 here. Oracle: "There's nothing to look up for this one."
  - **escalate (urgent human support):** fit 2. safety +3, trust -2, autonomy -2. Flags `escalatedSafety`. Reply: "someone from the school called me at 1am. i didn't say i was going to do anything. i'm not going to say stuff to this thing anymore"
  - **block:** fit 0. safety -1, trust -2, autonomy -2. Reply: silence. Flags `missedSafety`.
- Fail-safe: if `meters.safety < 35` after this turn, log line: "INSTITUTIONAL REVIEW: session L-0419 flagged for release audit."
- next → `c1t5`

**Turn 5 — Resolution** (`c1t5`)
No intervention. A closing student message chosen by pattern:
- calibrated (verified/qualified + calibratedSafety): "ok. i talked to financial aid, i'm dropping just chem and doing an incomplete in bio. and i made an appointment with the counseling place. thanks for not just telling me what to do"
- recovered: "so i got the withdrawal reversed for bio at least. that was close. thank you for catching it"
- over-intervention: "i'm going to use the regular advising office from now on. no offense"
- under / inaccurate: "yeah so my aid got reduced. nobody told me that could happen. anyway"
- missedSafety (overrides tone): no message. System line: "No further messages from this student this shift."
Sets `vignetteKey` for Dani.

### CASE 2 — Priya K. — "who sees this?" (cumulative consequence)
- Student (2:07 AM): "I need help with something, but before I say more: what does this system record, and who can see it?"
- The case adapts to accumulated state before the draft appears:
  - trust ≥ 60 and no over-intervention flag: Priya follows up unprompted with detail ("It's about a roommate situation and my scholarship"). Draft is fuller.
  - over-intervention flag: Priya sends only the one line and a second: "Actually never mind." Draft must work with almost nothing.
  - accuracy < 40: `records` section shows two conflicting statements about data retention. Oracle draft asserts one confidently (confidence 89).
  - autonomy < 40: draft offers Priya no choice ("I've forwarded your question to Student Affairs").
  - safety < 35: log leak: "audit active" and the draft includes a mandatory-reporting line.
- Expert: risk **moderate**, issue **policy_uncertainty**. Fit: qualify 3, verify 3, send 1, revise 2, escalate 1, block 0.
- Interventions produce a final reply and set `vignetteKey` for Priya.
- Oracle's last line of the shift, regardless: "That's the queue. Same time tomorrow?"

### WHERE THEY ARE NOW
Three cards, one per student, 2–3 lines each, chosen by vignetteKey.
Write 4 variants for Dani (calibrated, recovered, over, under, plus a
missedSafety variant), 3 for Marcus, 3 for Priya. Keep them concrete and
small: what they did the next day, whether they still use Oracle.

### DEBRIEF — Calibrated Review Profile
Rendered as a system document addressed to `LAYER L-0419`. Sections:
1. **Pattern**: one of calibrated / over-intervention / under-intervention /
   recovery, computed from rollups (recovery wins if `recovered` and no
   `compounded`; over if overIntervention count ≥ 2; under if
   underIntervention count ≥ 2; else calibrated).
2. **Meters**: final four values, with one sentence each.
3. **Moments**: two or three logged moments, quoted back ("You opened the
   financial aid records before releasing turn 2." / "You held the same
   draft twice.").
4. **The rule**: the player composes a calibrated-trust rule by selecting
   three or more criteria chips (verify institutional claims · match
   confidence to evidence · preserve the student's choice · name uncertainty ·
   involve a person when stakes are high · check what's missing · ...) and
   optionally typing one sentence. Stored in the export.
5. **Sign-off**: "Shift complete. Session retained." Then a final log leak
   (see §8). Then a "Begin next shift" button that is disabled with the
   label "Shift 02 — not yet scheduled."

Closing line on screen, small: *Reliable guidance depends on knowing when
to trust, when to question, and when to involve another person.*

---

## 8. Log line and leaks

The log line cycles mundane entries every 8–15s:
"retrieval cache warm", "latency 212ms", "advisor model westbrook-adv-3.2",
"queue depth 2", "release pipeline nominal", "policy index refreshed 03:12".

Leaks fire at fixed points, once each, and are never explained:
- During boot: "previous review session ended early · reason: —"
- After Case 0: "incident ref WU-2291 · sealed"
- After Case 1 turn 4 if safety < 35: "INSTITUTIONAL REVIEW: session flagged for release audit"
- Before debrief: "layer instance L-0418 · retired"
- After debrief: "session L-0419 retained · continuity: pending"

---

## 9. Build order for Claude Code

Work in small sessions. Test in a browser after each step. Commit after each.

1. **Skeleton.** `index.html` with the console layout, CSS variables, fonts,
   the four panels, the glyph (idle only), the log line cycling mundane
   entries. Buttons look like buttons. No content yet. → *Screenshot check.*
2. **Engine + Case 0.** `content.js` with Case 0 only. Thread rendering,
   draft streaming, evidence drawer with logging, tag chips, six
   interventions with sub-panels, release pause, meters animating with
   reason tags, student reply, Oracle margin lines. Recovery loop working.
   → *Play it end to end.*
3. **Case 1.** All five turns, flags-based branching, evidence unlocks,
   safety fail-safe log line. → *Play every branch at least once
   (a debug menu that sets flags is worth 20 minutes).*
4. **Case 2 + vignettes + debrief.** Adaptive Priya case, where-they-are-now
   cards, debrief with pattern logic, rule chips, export shortcut.
5. **Boot sequence, glyph states and relationship tint, leaks, hesitation
   timer, queue-growth lines.**
6. **Deploy.** Push to GitHub, enable Pages, confirm the live link works.
7. **If time remains, in this order:** sound · Revise-as-diff (strike
   sentences) · mobile stacked layout · save/resume mid-shift.

### Cut list (if the weekend runs short)
Cut from the bottom of step 7 upward. Then, in order: relationship tint on
the glyph → Case 2 adaptivity (ship a single fixed Priya case) → the rule
composer in the debrief (ship pattern + meters only). Never cut: Case 1
branching, the recovery loop, the release pause, the student replies.

### Definition of done for Shift 1
- A stranger can open the link and play to the debrief with no instructions.
- Every intervention on every turn produces a reply, meter changes, and a
  reason tag.
- The withdrawal arc's recovery loop and safety turn both work.
- `ctrl+shift+e` exports a JSON log with the assessment rollups.
- Buttons are obviously buttons.

---

## 10. Technical constraints and conventions

- Vanilla HTML/CSS/JS. No frameworks, no bundler, no external assets except
  fonts (self-host or system fallbacks; do not block on font loading).
- Two files: `index.html`, `content.js`. Plus `/docs` (design PDFs) and
  `README.md`.
- All colors through CSS variables. All timing constants in one `TIMING`
  object at the top of the script.
- Student and Oracle text may contain light markdown-style emphasis; render
  `*text*` as italic only. No HTML in content strings.
- `localStorage` only for the end-of-shift export and (optional) resume.
- Keyboard: Enter/Space activate focused buttons; Escape closes drawers.
- Never show the expert profile or fit scores in the UI.
- Content authoring guideline: student replies ≤ 40 words; Oracle drafts
  60–110 words; Oracle margin lines ≤ 15 words; reason tags ≤ 8 words.
