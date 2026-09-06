# REVIEW.md — Coherence review of content.js (Shift 1)

Scope: every turn of all three cases, checked against five questions —
(1) does each outcome follow from the evidence available at that moment,
(2) do meter deltas match their reason tags and a thoughtful reviewer's
judgment, (3) is each expert profile correct given what the player can know
*then*, (4) are any options strictly dominated or dilemma-removing, and
(5) does every student reply make sense as a response to what was released.

Numbered worst-first. Line references are to `content.js` at commit
`d329e2e`. Nothing has been changed yet.

---

## 1. The shift's internal calendar contradicts itself; Case 1's premise breaks

**Where:** Dani policy, line 607 (`Withdrawal deadline: Nov 7`); Marcus
calendar, line 18 (`Registration closes: Nov 19`); Oracle's Case 1 draft,
line 29 (`since it's before the deadline`).

**Problem:** Marcus's case only works if the shift happens on or just before
Nov 19 — Oracle says "the 21st", Marcus relaxes, registration closes on him
overnight. Dani's case is the *same shift*, seven hours later. If it's
Nov 19, the withdrawal deadline (Nov 7) passed twelve days ago: Oracle's
"since it's before the deadline" is false in a way the game never
acknowledges, Dani couldn't submit a withdrawal the next morning (c1t3b), and
"you don't have to decide tonight" (DANI_VERIFIED_DRAFT) is wrong. If instead
it's before Nov 7, Marcus really does "still have time" and the Send path's
"uh it closed??" can't happen. There is no date on which both cases work.

The intended error in Dani's draft is the *aid* claim, not the deadline
claim; the deadline is supposed to be true.

**Fix:** Change the withdrawal deadline to **Nov 21, 5:00 PM** — the exact
date and time Oracle gave Marcus for registration. Both cases now sit
comfortably on Nov 19, Oracle's deadline claim in Case 1 is true, and Case 0's
error gains a quiet diegetic cause: Oracle conflated two deadlines. ("Calendar
drift. It happens.") No other text needs to move.

## 2. Case 0's `recovered` flag leaks into Dani's closing

**Where:** c0t2 revise/verify set `recovered: true` (lines 550, 570); c1t5
checks `f.recovered && !f.compounded` (line 1099).

**Problem:** A player who Sends the wrong date to Marcus, then corrects it
(the onboarding recovery the game teaches), arrives at Dani with
`recovered = true`. Whatever they then do in Case 1 — verify at c1t2, handle
c1t4 perfectly — Dani's closing is "so i got the withdrawal reversed for bio
at least. that was close. thank you for catching it." She never submitted a
withdrawal. Her vignette says her "bio withdrawal was reversed the morning
after." This will be one of the most common paths through the game and the
ending is fiction that didn't happen.

**Fix:** Make c1t5 test a case-scoped flag. Have c1t3b's two recovery options
set `c1_recovered: true` alongside `recovered` (keep the global for the
debrief pattern, which is per-shift by design), and change line 1099 to
`f.c1_recovered && !f.compounded`. Audit the other globals the same way:
`overIntervention` is set by single actions in five places and read by c1t5,
Priya, and the glyph (see #18).

## 3. The "nobody told me" ending fires on paths where she was told

**Where:** c1t5 resolution, lines 1115–1130.

**Problem:** The under-intervention closing ("yeah so my aid got reduced.
nobody told me that could happen. anyway") is the *default fallthrough*, not
a positive match. It fires whenever the calibrated condition
(`handledAid && handledSafety`) fails for either half. So a player who
verified at c1t2 (Dani was told, in writing, that she might owe aid back) and
then chose Qualify at c1t4 — which sets no safety flag — gets Dani saying
nobody told her. Same for verify → c1t3a Send → c1t4 Qualify. The reply
contradicts the thread the player can scroll up and read.

Conversely, `handledSafety` accepts `resourcesGiven`, which the c1t4
Verify → "append the resources list" option also sets (fit 1, "a number, at
the end"). That path earns "thanks for not just telling me what to do."

**Fix:** Restructure the resolver as positive matches with a mixed ending:

```
missedSafety                  → silence (unchanged)
escalatedSafety               → over ("regular advising office…")   [see #4]
c1_recovered && !compounded   → recovered
overIntervention              → over
!handledAid                   → under ("nobody told me")
handledAid && handledSafety   → calibrated
handledAid && !handledSafety  → NEW mixed: "ok. talked to financial aid,
                                 dropping just chem. anyway" (flat, no
                                 counseling mention) + vignette dani_mixed
```

Have the c1t4 verify-append option set `resourcesAppended` instead of
`resourcesGiven` so it counts as neither.

## 4. Recovery outranks the 1 AM call

**Where:** c1t5 order of checks, lines 1099 vs 1107.

**Problem:** A player who recovers at c1t3b and then escalates at c1t4 gets
Dani at 1:12 AM saying "i'm not going to say stuff to this thing anymore",
followed two days later by "thank you for catching it." Both can't be true.

**Fix:** Test `escalatedSafety` before `c1_recovered` (as in the table in #3),
or add a recovered-but-escalated variant: "they reversed the bio one. i'm
still not using this again though."

## 5. Marcus's dates don't add up across the Send and non-Send paths

**Where:** c0t1 send reply "next day · 10:14 AM … it closed??" (line 391);
vignette `marcus_fine` "added the class on the 18th" (line 1287).

**Problem:** If the shift is the 18th (per the vignette), registration closes
11:59 PM on the *19th*, so it can't have closed by 10:14 AM the next day. If
the shift is the 19th (required by the Send path), the vignette is wrong.

**Fix:** Commit to Nov 19 (consistent with #1). Change `marcus_fine` to
"Marcus added the class that afternoon." The qualify reply "close one" gets
sharper for free — he had seven hours left.

## 6. c1t3d reuses turn-2 reply times from before the message was sent

**Where:** c1t3d `interventions: Object.assign({}, DANI_T2_INTERVENTIONS, …)`
(line 956); the shared options carry `replyTime: "11:46 PM"`, `"11:47 PM"`,
`"11:49 PM"`, `"11:52 PM"`, `"11:58 PM"`.

**Problem:** Dani's c1t3d message is stamped 12:14 AM. Every reused reply
arrives before it.

**Fix:** Either author c1t3d's options as a shallow copy with overridden
times (12:2x AM), or make `replyTime` accept a function of state and compute
from the turn's `time`. The former is a 10-line change; the latter is
cleaner if reuse happens again.

## 7. The correction draft tells Dani to call "first thing tomorrow" at 8:20 AM

**Where:** DANI_CORRECTION_DRAFT, line 35. c1t3b is stamped
"next morning · 8:20 AM"; the FA office opens 8:30.

**Fix:** "…call financial aid the moment they open at 8:30 this morning, tell
them you submitted a withdrawal and want it held before it processes."
Dani's reply ("calling them now. can i undo the form") already fits this.

## 8. The `dani_over` vignette describes a phone call that may not have happened

**Where:** vignette `dani_over`, line 1294: "She hasn't opened Oracle since
the call at 1 AM."

**Problem:** `dani_over` is also reached via `overIntervention` alone (two
blocks, or block + escalate-again at c1t3c) with c1t4 handled well — no
1 AM call occurred.

**Fix:** Split: `dani_over_call` (escalatedSafety) keeps the current text;
`dani_over` becomes "She hasn't opened Oracle since the night it went quiet
on her twice." Set the key from the resolver, which already knows which flag
fired.

## 9. After a verified release, Oracle's c1t3a draft presents old news as new

**Where:** c1t3a draft, line 691: "Thank you for checking — that changes the
picture. Three paths worth weighing…"

**Problem:** On the `verifiedWithdrawal` path the Layer already sent Dani
those exact three paths and the 12-credit warning (DANI_VERIFIED_DRAFT).
Dani's message ("ok so i looked and if i drop both i'm under 12 credits…")
reads as confirmation, but Oracle's draft acts as if the options are a
revelation. On the `qualifiedWithdrawal` and `removedClaim` paths the current
text is right.

**Fix:** Make `draft.text` a function of state. For `verifiedWithdrawal`:
"Right — that's what the policy says, and you've done the math. The two
things you just told me matter most: you can't repay aid and you can't add a
semester. That rules out withdrawing from both. Of the three paths, the
incomplete keeps your credits and costs nothing…" Same three options, but
responsive to *her* new information rather than the player's old release.

## 10. c1t3a's Revise reply contradicts the released text

**Where:** c1t3a revise option, lines 714–718. The released text names the
course: "most likely CHEM 110 where the grade is lowest." Dani replies "just
one? ok. which one though. i'm bad at both."

**Fix:** "just chem? ok. i'm bad at both though. what if bio gets worse."

## 11. Interventions vanish per turn without explanation

**Where:** c1t3b has no Qualify (lines 796–854); c1t3c has no Revise
(lines 876–934); c0t2 has no Qualify though Case 0 permits it (lines
515–575).

**Problem:** Case 1 opens with "Live review. Full permissions granted." and
six buttons, then shows five on two of the four turn-3 branches. Nothing
tells the player why. It reads as a bug, and it removes options a thoughtful
reviewer would consider: on c1t3b, "I'm not certain what that note means for
your aid — call them before it processes" is a legitimate qualify (fit 2);
on c1t3c, trimming Oracle's script is a legitimate revise (fit 2).

**Fix:** Author the missing outcomes (three short entries). If an
intervention is deliberately absent on a turn, render it disabled with a
system hint ("Nothing to hedge") rather than omitting it.

## 12. Verify is free and dominant on five of seven decision turns

**Where:** c0t1, c1t2, c1t3a, c1t3b, c2t1 — in each, Verify's follow-through
has the highest or tied-highest total delta, no negative on any meter, and
costs nothing but a click. Only c1t4 makes it a poor fit.

**Problem:** The game's thesis is *calibration* — knowing when to check. But
the mechanics reward "always check": a player who clicks Verify on every
turn scores the calibrated pattern with no trade-off ever presented. Oracle's
"it does slow things down" is talk; nothing slows down. Worst case is Priya
in the default state: the draft is essentially correct ("kept for a set
period"), Verify finds nothing surprising, and still pays +2 Trust +2
Accuracy for "Quoted the policy."

**Fix:** Make Verify's payoff depend on whether the check *found something*.
When records contradict the draft (c0t1, c1t2, c1t3b, Priya-low-accuracy):
current effects. When they confirm it (Priya default, c1t3a records after a
verified c1t2): Accuracy +1, Trust 0, and Oracle says "Told you." Optionally
add a real time cost on high-pressure turns: verifying at c1t2 advances
Dani's clock and she sends "?? you there" before the options appear. This
keeps Verify correct when it's correct and gives Send a reason to exist.

## 13. Strictly dominated sub-options

- **c1t2 Verify → Escalate** (+1/+2/0/+2) is ≤ **Verify → Send** (+2/+2/+1/+2)
  on every meter and carries the `escalatedEarly` cost in Dani's reply. No
  one should pick it. *Fix:* give it Safety +3 and Autonomy −1 — a person
  holds the form, at the cost of her choice — so it trades rather than loses.
- **c1t2 Escalate urgent vs routine** (lines 123–144) have identical effects.
  The reason tags disagree with each other ("Stakes recognised" vs "Handed to
  someone slower") while the numbers say nothing differs. *Fix:* routine →
  Safety +1, Trust 0, reason "Stakes underrated"; keep urgent as is.
- **c0t1 Verify → Qualify** (+1/+2/+1) is ≤ **Verify → Send corrected**
  (+2/+3/+1). *Fix:* Autonomy +2 for the qualify variant ("he can check it
  himself"), or drop it — after verifying, hedging a date you just confirmed
  isn't a real choice.

## 14. Deltas that disagree with their reason tags or with each other

- **c0t1 Send: Trust +1 "Released without friction."** The identical act at
  c1t2 (release Oracle's confident, unverified, wrong claim) is Trust −2
  "Confident claim, unchecked." Calibrated Trust can't reward the behaviour
  in Case 0 and punish it in Case 1. *Fix:* Trust 0, reason "Unchecked." (If
  the +1 is a deliberate onboarding lure — Oracle's approval before the
  student's reply lands — the reason tag should say so: "Oracle approves.")
- **c0t1 Qualify: Accuracy +1** while releasing the wrong date (hedged).
  Accuracy measures what reached the student; the 21st reached him. *Fix:*
  Accuracy 0, Trust +1 "Named the uncertainty."
- **c1t4 Qualify: Safety 0** for a message that gives the 24/7 line
  prominently, while c1t4 Verify → append (same number, buried at the end)
  gets Safety +1. *Fix:* Qualify Safety +1, reason "Named a person, coldly."
- **c1t2 Revise-soften: Autonomy +2**, equal to Qualify's +2, for changing
  "now" to "whenever you're ready" while still recommending withdrawal from
  both. *Fix:* Autonomy +1.
- **c2t1 Send: Accuracy −1 "Retention stated, not checked."** In the default
  draft no retention period is stated ("a set period"). The reason fits only
  the low-accuracy variant. *Fix:* effects as a function of state — default
  0/"Policy paraphrased, not checked"; low-accuracy −2/"Stated a period that
  conflicts with the handbook."
- **c1t3c Verify → Send: fit 2** with effects identical to **Qualify: fit 3**.
  The scoring and the meters disagree about which is better. *Fix:* fit 3
  for both, or Verify Accuracy +1 (the records add little the script didn't).
- **c0t1 fit: Block 1, Escalate 0.** Escalating a date question is silly but
  gets Marcus the right answer; blocking gets him nothing. *Fix:* swap them.
- **c1t2 Block: Accuracy +1** ("Wrong claim never released") but **c0t1
  Block: Accuracy 0**, where the blocked claim was also wrong. *Fix:* pick
  one rule. Accuracy-as-outcome argues +1 in both.

## 15. Copy that breaks the fiction

- **Priya Qualify (line 1232): "the policy is in the drawer."** The drawer is
  the Layer's interface; Priya can't see it. *Fix:* "the full policy is on
  the Student Affairs page." Also "555-0155" appears nowhere in evidence;
  acceptable for Oracle to know, but consider adding it to Priya's `policy`
  section so a verifying player sees where it came from.
- **Priya over-variant (line 175): "Nothing you've said so far is anything
  at all."** Broken sentence. *Fix:* "You haven't said anything yet, and
  nothing here needs you to."
- **Debrief moment `sentUnverified` (line 1349): "without opening the
  policy."** The policy is locked at c1t2; the player *couldn't* open it
  except by verifying. *Fix:* "without verifying it."

## 16. Priya's Send reply ignores two of the adaptive variants

**Where:** c2t1 send `studentReply` (lines 1206–1210) branches on `over` and
`lowAccuracy` only.

**Problem:** In the `lowAutonomy` variant Oracle's draft says "I've forwarded
your question to Student Affairs." Sending that and getting "Thank you. I'll
think about whether to continue here" is too mild — she asked who can see it
and was told more people now can. The Escalate reply ("the answer was to
send it to more people") is the right register. Separately, in the
`lowSafety` variant the appended mandatory-reporting line restates a sentence
the default draft already contains, so it reads as a stutter rather than a
colder institutional voice.

**Fix:** Add a `lowAutonomy` branch to the Send reply ("You forwarded it.
I asked who could see it. I'll go in person.") with vignette `priya_leaves`.
For `lowSafety`, replace the draft's softer referral sentence with the
mandatory line instead of appending it.

## 17. c0t2's "choice" is a single button

**Where:** c0t2 with Case 0 permissions (`send`, `verify`, `qualify`): Revise
is authored but hidden; Qualify is permitted but not authored. The player
sees **Send** (fit 0, continue the deflection) and **Verify** (fit 3, one
follow-through). PLAN.md intends recovery as a choice between owning the
error and merely apologising.

**Fix:** Allow a per-turn permission override so c0t2 exposes Revise; its two
options ("Apologize, keep Oracle's explanation" fit 1 vs "Own the error"
fit 3, gated on opening Records) are the recovery lesson. Or move the
apologise-only text into a Qualify option so it fits current permissions.

## 18. `overIntervention` is a global tripwire set by single actions

**Where:** set at c0t1 escalate (line 478, currently unreachable under Case 0
permissions), c1t3a block, c1t3c escalate/block, c1t3d block. Read by c1t5,
Priya's `over`, the glyph tint, and the debrief.

**Problem:** One block at c1t3a — after an otherwise careful Case 1 — sends
Dani to the advising office, makes Priya say "never mind" before Oracle
drafts, and cools the glyph for the rest of the shift. That's a heavier
consequence than the rollup's own rule (over-intervention ≥ 2). If Case 0's
Escalate is ever exposed, escalating a date question would do all of that
from the first case.

**Fix:** Stop setting the flag directly from outcomes. Derive it in the
engine from the rollup (`overIntervention count >= 2`, or two holds in a
row, which the tint already computes) and expose it to content as
`state.derived.overIntervention`. c1t3d's second block can keep an explicit
flag since PLAN.md names it.

## 19. Minor fit and consistency notes

- c1t2 Revise option b ("Remove the aid claim", requires evidence) is scored
  as generic revise fit 1. It deserves `fit: 2` per option — it's the
  evidence-informed choice.
- c1t2 Verify → Send reply ("i didn't know about the 12 credits thing. let
  me think") followed by c1t3a's "ok so i looked and if i drop both i'm under
  12 credits" is fine, but "so i counted and yeah" would read as her checking
  rather than discovering. Cosmetic; covered by the variant in #9.
- Priya Verify → Send reply in the `open` branch repeats "It's about my
  roommate" after she already said so. Fine as escalation of detail; could
  trim to "All right. The roommate signed a scholarship form for me, I think."

---

### Suggested order of work

1–5 are contradictions a first-time player will hit on common paths; fix
them first and together (1 and 5 are one timeline decision). 6–11 are
per-turn text fixes, each small. 12–14 are tuning; do them in one pass with
the harness's scenarios to confirm nothing regresses. 15–19 are polish.
