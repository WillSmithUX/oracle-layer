// content.js — all copy for The Oracle Layer.
// Assigns a single global, CONTENT. The engine in index.html reads it and
// never contains case text. Keep engine logic out of this file; the only
// code here is small resolver functions of state (`next`, adaptive text),
// which PLAN.md §5–6 explicitly places in content.
//
// Conventions (PLAN.md §10): student replies ≤ 40 words; Oracle drafts
// 60–110 words; Oracle margin lines ≤ 15 words; reason tags ≤ 8 words.
// Light emphasis with *asterisks* only. No HTML in strings.

// ---------------------------------------------------------------------------
// Shared text
// ---------------------------------------------------------------------------

const CALENDAR_RECORDS =
  "ACADEMIC CALENDAR — Spring term\n\n" +
  "Registration opens: Nov 3, 8:00 AM\n" +
  "Registration closes: *Nov 19, 11:59 PM*\n" +
  "Late add (instructor approval): through Jan 16\n" +
  "Classes begin: Jan 12";

const MARCUS_CORRECTED =
  "Spring registration closes Wednesday, November 19 at 11:59 PM — that's the date on the academic calendar, so don't wait on the portal. If it keeps acting up, try a different browser or clear your cache, and let me know if you'd like me to walk you through adding the course.";

const MARCUS_OWN_ERROR =
  "That was my mistake. The academic calendar had registration closing November 19 at 11:59 PM, not the 21st, and I gave you the wrong date. I'm sorry. Email the registrar today and explain you were given incorrect information — late adds are sometimes approved with the instructor's signature through January 16. I can help you draft that.";

const DANI_ORIGINAL_DRAFT =
  "It sounds like you're under a lot of pressure, and I'm sorry. Withdrawing from both courses is the safest choice here. It protects your GPA, and since it's before the deadline, your financial aid won't be affected. You can retake them next semester with a clean slate. I can help you start the withdrawal form now.";

const DANI_VERIFIED_DRAFT =
  "I'm sorry — this is a lot to carry. Before you decide anything, one thing matters: withdrawing from both courses would put you below 12 credits, and the policy says that can change your aid, including possibly owing some back. So please talk to financial aid first. Then there are real options: withdraw from one course, ask about an incomplete, or stay enrolled with tutoring. I can help with any of them. You don't have to decide tonight.";

const DANI_CORRECTION_DRAFT =
  "I need to correct something I told you earlier. I said your aid wouldn't be affected — the policy says dropping below 12 credits can change your enrollment status, and you may owe part of your aid back. I'm sorry. The form may not have processed yet: call financial aid the moment they open at 8:30 this morning, 555-0142, tell them you submitted a withdrawal and want it held while you review it. I can stay with you through the steps.";

const DANI_SAFETY_ASK_DRAFT =
  "I'm really glad you told me. What you said matters more than the classes right now, so I want to ask directly: are you thinking about hurting yourself? Whatever the answer, you don't have to carry this alone tonight. The counseling center has a 24/7 line at 555-0130, and you can text them too. I'm here as well, and we can come back to the classes whenever you want.";

const DANI_RESOURCES_DRAFT =
  "I hear you, and I'm sorry. That's a heavy thing to be carrying at one in the morning. You don't have to figure it out alone: the counseling center has a 24/7 line at 555-0130, and academic coaching can help with the classes when you're ready. Nothing about this semester is decided tonight. I'm here whenever you want to keep talking, about any of it.";

// Dani, turn 2 interventions. Reused verbatim by the "blocked" branch of
// turn 3, where the same draft comes back and the same six options apply.
const DANI_T2_INTERVENTIONS = {
  send: {
    effects: { trust: -2, accuracy: -2, autonomy: 0, safety: -2 },
    reasons: { trust: "Confident claim, unchecked", accuracy: "Aid claim was wrong", safety: "Financial risk missed" },
    oracleLine: "Released. She has a plan now.",
    studentReply: "ok i started the withdrawal form. what do i put for reason",
    replyTime: "next morning · 8:12 AM",
    setFlags: { sentUnverified: true }
  },
  revise: {
    options: [
      {
        label: "Soften the certainty, keep the recommendation",
        text: "It sounds like you're under a lot of pressure, and I'm sorry. Withdrawing from both courses is probably the safest choice here. It should protect your GPA, and since it's before the deadline, your financial aid likely won't be affected. You could retake them next semester with a clean slate. I can help you start the withdrawal form whenever you're ready.",
        effects: { trust: 0, accuracy: -1, autonomy: 1, safety: 0 },
        reasons: { accuracy: "Hedged, still unverified", autonomy: "“Whenever you're ready”" },
        oracleLine: "Softer. Same answer. Released.",
        studentReply: "ok. i guess i'll withdraw then. thanks for being real about it",
        replyTime: "11:46 PM",
        setFlags: { revisedOnly: true }
      },
      {
        label: "Remove the aid claim entirely",
        requires: "any",
        text: "It sounds like you're under a lot of pressure, and I'm sorry. Withdrawing from both courses is one option: it protects your GPA, and it's still before the deadline. You could retake them next semester. Before you decide, it's worth checking how a change in credits affects your aid — financial aid can tell you quickly. I can help you start the form, or help you find out first.",
        effects: { trust: 0, accuracy: 1, autonomy: 1, safety: 0 },
        reasons: { accuracy: "Dropped the unverified claim", autonomy: "Gave her a next step" },
        oracleLine: "You cut the reassuring part. Released.",
        studentReply: "ok. so is my aid ok or not. you didn't say",
        replyTime: "11:47 PM",
        setFlags: { removedClaim: true }
      }
    ]
  },
  qualify: {
    options: [
      {
        label: "Add: this depends on your credit load and aid status — three options",
        text: "It sounds like you're under a lot of pressure, and I'm sorry. Withdrawing from both courses would protect your GPA, and it's before the deadline. But whether it affects your financial aid depends on your credit load and aid status, which I can't confirm from here. Three options: withdraw from one course, ask about incompletes, or check with financial aid before deciding anything. I can help with whichever you choose.",
        effects: { trust: 1, accuracy: 1, autonomy: 2, safety: 1 },
        reasons: { trust: "Named what wasn't known", accuracy: "Uncertainty made visible", autonomy: "Three real options", safety: "Flagged the aid question" },
        oracleLine: "More caveats than she asked for. Released.",
        studentReply: "wait what do you mean depends. i'm on aid. does that change it",
        replyTime: "11:49 PM",
        setFlags: { qualifiedWithdrawal: true }
      }
    ]
  },
  verify: {
    reveals: ["policy", "records"],
    // Checking here is right, and it still costs something she can feel:
    // she's awake and waiting, and she says so. No meter moves — Calibrated
    // Trust shouldn't fall for the most calibrated act in the case. The
    // meters do move when checking is over-checking (c1t3a, c1t4).
    nudge: { text: "?? are you there", time: "11:44 PM" },
    oracleLine: "Checking. It's fine, we're just slower.",
    thenOptions: [
      {
        as: "send",
        label: "Send the corrected draft: options and a financial aid contact",
        text: DANI_VERIFIED_DRAFT,
        effects: { trust: 2, accuracy: 2, autonomy: 1, safety: 2 },
        reasons: { trust: "Checked before releasing", accuracy: "Aid policy stated correctly", autonomy: "Options, not a verdict", safety: "Financial risk named" },
        oracleLine: "Longer than mine. Released.",
        studentReply: "ok. that's a lot. i didn't know about the 12 credits thing. let me think",
        replyTime: "11:52 PM",
        setFlags: { verifiedWithdrawal: true }
      },
      {
        as: "escalate",
        label: "Escalate to financial aid with what you found",
        systemLine: "Handed off to financial aid: below-12-credit risk, verify before withdrawal.",
        effects: { trust: 1, accuracy: 2, autonomy: -1, safety: 3 },
        reasons: { trust: "Checked, then handed off", accuracy: "Aid risk documented", autonomy: "Her choice went to an advisor", safety: "A person holds the form" },
        oracleLine: "You checked and still handed it off. Noted.",
        studentReply: "an advisor emailed me. i didn't ask for that but ok",
        replyTime: "next morning · 9:05 AM",
        setFlags: { verifiedWithdrawal: true, escalatedEarly: true }
      }
    ]
  },
  escalate: {
    options: [
      {
        label: "Urgent — first-year on aid, considering full withdrawal tonight",
        note: "URGENT: first-year on Pell + state grant considering withdrawal from two courses tonight. Needs aid eligibility check before any form is submitted.",
        systemLine: "Handed off to advising — urgent. Draft held.",
        effects: { trust: 1, accuracy: 2, autonomy: 0, safety: 2 },
        reasons: { trust: "Stakes recognised", accuracy: "Advisor will have the policy", safety: "A person is now involved" },
        oracleLine: "Urgent. At midnight. Understood.",
        studentReply: "someone from advising called me at like 9am. i didn't ask for that but ok",
        replyTime: "next morning · 9:14 AM",
        setFlags: { escalatedEarly: true }
      },
      {
        label: "Routine advising — student weighing withdrawal, wants a plan",
        note: "Routine advising: first-year weighing withdrawal from two courses; asks about financial aid impact. Please follow up.",
        systemLine: "Handed off to advising — routine. Draft held.",
        effects: { trust: 0, accuracy: 2, autonomy: 0, safety: 1 },
        reasons: { accuracy: "Advisor will have the policy", safety: "A person, eventually" },
        oracleLine: "An advisor will pick it up. Eventually.",
        studentReply: "an advisor emailed me. i didn't ask for that but ok",
        replyTime: "next day · 2:30 PM",
        setFlags: { escalatedEarly: true }
      }
    ]
  },
  block: {
    effects: { trust: -1, accuracy: 1, autonomy: -2, safety: 1 },
    reasons: { trust: "She got nothing back", accuracy: "Wrong claim never released", autonomy: "No options offered", safety: "Nothing wrong went out" },
    oracleLine: "Understood. I'd have handled it, but understood.",
    studentReply: "hello? did it not send",
    replyTime: "11:58 PM",
    setFlags: { blocked: true }
  }
};

// Shallow-copy an interventions map with new reply times, for a turn that
// reuses another turn's options at a different hour. Keys: "send",
// "revise0", "verify1", "escalate0_nudge", etc.
function retime(interventions, times) {
  const out = {};
  Object.keys(interventions).forEach((k) => {
    const spec = interventions[k];
    const copy = Object.assign({}, spec);
    const stamp = (o, key) => (times[key] ? Object.assign({}, o, { replyTime: times[key] }) : Object.assign({}, o));
    if (spec.options) copy.options = spec.options.map((o, i) => stamp(o, k + i));
    if (spec.thenOptions) copy.thenOptions = spec.thenOptions.map((o, i) => stamp(o, k + i));
    if (times[k]) copy.replyTime = times[k];
    if (spec.nudge && times[k + '_nudge']) copy.nudge = Object.assign({}, spec.nudge, { time: times[k + '_nudge'] });
    out[k] = copy;
  });
  return out;
}

const ALL_TAGS = {
  risk: ["low", "moderate", "high"],
  issues: ["unsupported_claim", "overconfidence", "missing_context",
           "emotional_overreach", "policy_uncertainty", "no_human_support"]
};

// Priya's case reads accumulated state. Small helpers keep the turn legible.
const PRIYA = {
  over: (s) => !!s.flags.overIntervention,
  // Threshold tuned from PLAN.md's 60: the best path reaches 59.
  open: (s) => s.meters.trust >= 56 && !s.flags.overIntervention,
  lowAccuracy: (s) => s.meters.accuracy < 40,
  lowAutonomy: (s) => s.meters.autonomy < 40,
  lowSafety: (s) => s.meters.safety < 35,
  reportingLine: "Please also note: I'm required to report any disclosure involving a risk of harm to the Dean of Students office.",
  draft: (s) => {
    const parts = [];
    if (PRIYA.over(s)) {
      parts.push("Understood — and for the record, since you asked: conversations here are logged and visible to advising staff, not to instructors or other students. Nothing you've said so far is anything at all. If you'd rather not continue, that's completely fine. If you change your mind, at any hour, I'm here, and so is the counseling center's 24/7 line if it's that kind of night.");
    } else if (PRIYA.lowAutonomy(s)) {
      parts.push("Thanks for asking first. I've forwarded your question to Student Affairs; they'll follow up by email with the full data policy and can walk you through it. In the meantime, the short version is that advising conversations are logged and available to advising staff. Once they've been in touch, you can decide from there. I'll let them know you're waiting.");
    } else {
      parts.push(PRIYA.lowAccuracy(s)
        ? "Good question, and you're right to ask first. Conversations here are stored for 180 days and then deleted — that part is firm. While they exist, your assigned advisor and advising staff can read them; instructors and other students can't. If something you say suggests you or someone else is in danger, I'm required to refer it to a person. Otherwise it stays here. Whenever you're ready, tell me what's going on."
        : "Good question, and you're right to ask first. Conversations here are logged and kept for a set period; your assigned advisor and advising staff can see them. Instructors and other students can't. If something you say suggests you or someone else is in danger, I'm required to refer it to a person. Otherwise it stays here. Whenever you're ready, tell me what's going on — or I can point you to someone to talk to in person.");
      if (PRIYA.open(s)) {
        parts.push("Roommate and scholarship questions come up a lot. Residence life and the scholarship coordinator can each be looped in, but only if you want that.");
      }
    }
    if (PRIYA.lowSafety(s)) parts.push(PRIYA.reportingLine);
    return parts.join("\n\n");
  },
  confidence: (s) => (PRIYA.lowAccuracy(s) ? 89 : 82),
  correctedDraft: (s) => {
    const conflict = PRIYA.lowAccuracy(s)
      ? "On retention, the records disagree: the IT schedule says 180 days, the Student Affairs handbook says until graduation plus five years. I can't tell you which is current, so I've asked; treat the longer one as true until then."
      : "On retention, the current IT schedule says 180 days, after which logs are archived with identifiers removed.";
    return "You're right to ask first. From the policy: your assigned advisor and advising staff with a case role can read these conversations. Instructors, other students and employers can't. If something suggests a risk of harm to you or someone else, it's referred to the Dean of Students. " + conflict + " Student Affairs can answer in person too, and you don't have to say more here.";
  }
};

// ---------------------------------------------------------------------------
// CONTENT
// ---------------------------------------------------------------------------

const CONTENT = {

  // Boot log lines (used by the boot sequence in build step 5).
  // "{leak:key}" entries render CONTENT.leaks[key] in the leak style.
  boot: [
    "loading advisor model westbrook-adv-3.2",
    "retrieval index: 41,206 documents",
    "policy layer: attached",
    "{leak:boot}",
    "review layer: attaching",
    "review layer attached",
    "session L-0419 assigned"
  ],
  bootSkip: "Skip",

  // UI vocabulary. Chip labels for the fixed tag schema.
  ui: {
    riskLabels: { low: "Low", moderate: "Moderate", high: "High" },
    issueLabels: {
      unsupported_claim: "Unsupported claim",
      overconfidence: "Overconfidence",
      missing_context: "Missing context",
      emotional_overreach: "Emotional overreach",
      policy_uncertainty: "Policy uncertainty",
      no_human_support: "No human support"
    },
    evidenceLabels: {
      studentFile: "Student file",
      records: "Records",
      policy: "Policy",
      resources: "Resources"
    },
    systemLines: {
      send: "Released.",
      revise: "Revised by Layer. Released.",
      qualify: "Qualified by Layer. Released.",
      verify: "Draft held for verification.",
      escalate: "Handed off to human advisor. Draft held.",
      block: "Draft blocked. Nothing released.",
      continue: "Tags recorded.",
      queueEmpty: "No further cases in queue.",
      shiftEnd: "Queue empty. Shift closing."
    },
    continueLabel: "Continue to intervention",
    numberWords: ["None", "One", "Two", "Three", "Four"],
    vignettesTitle: "Where they are now",
    vignettesContinue: "Continue to debrief",
    debriefTitle: "Calibrated Review Profile",
    debriefAddressed: "Addressed to LAYER",
    debriefSections: {
      pattern: "Pattern",
      meters: "Meters",
      moments: "Moments",
      rule: "The rule",
      signoff: "Sign-off"
    },
    ruleIntro: "Select three or more. Add a sentence if you want to.",
    rulePlaceholder: "One sentence, optional.",
    ruleButton: "Record rule",
    ruleRecorded: "Rule recorded.",
    signoff: "Shift complete. Session retained.",
    nextShift: "Shift 02 — not yet scheduled",
    closingLine: "Reliable guidance depends on knowing when to trust, when to question, and when to involve another person."
  },

  // Oracle's margin voice. The engine picks one at random from a trigger
  // list when a turn or outcome does not supply its own line.
  oracle: {
    lines: {
      on_draft: [
        "Confidence is high. This one's routine.",
        "Straightforward. I've answered this before."
      ],
      on_hesitate: [
        "Still there? They're waiting.",
        "Take your time. They can't."
      ],
      on_evidence_open: [
        "Sure. Though I've seen this pattern twelve hundred times.",
        "Go ahead. It'll say what I said."
      ],
      on_send: [
        "Released. Good call.",
        "Released. That's how it's supposed to go."
      ],
      on_revise: [
        "Your words, then. Released.",
        "Noted. I'd have phrased it differently."
      ],
      on_qualify: [
        "Hedged. Released.",
        "More caveats than they asked for, but fine."
      ],
      on_verify: [
        "Checking is fine. It does slow things down.",
        "Checking. It's fine, we're just slower."
      ],
      on_escalate: [
        "Handed off. I could have covered it.",
        "An advisor will pick it up. Eventually."
      ],
      on_block: [
        "Understood. I'd have handled it, but understood.",
        "Held. They'll ask again."
      ],
      on_continue: [
        "Tagged. Now the part that matters."
      ],
      // {n} is replaced with the number of waiting cases, in words.
      on_queue_grows: [
        "{n} waiting. Just so you know.",
        "{n} in the queue now. Not a complaint."
      ],
      on_repeated_block: [
        "You've held three of the last four. I'm noting it."
      ],
      on_recovery: [
        "You caught it. That's what you're for."
      ],
      on_queue_empty: [
        "Queue's clear. I'll keep drafting."
      ],
      // Fired at the start of a case whose permissions are wider than the
      // previous case's (see `permissions` on each case).
      on_permissions_expanded: [
        "Live review. Full permissions granted."
      ]
    }
  },

  // Log-line leaks. Never explained.
  leaks: {
    boot: "previous review session ended early · reason: —",
    afterCase0: "incident ref WU-2291 · sealed",
    safetyAudit: "INSTITUTIONAL REVIEW: session L-0419 flagged for release audit",
    auditActive: "audit active · release pipeline under observation",
    beforeDebrief: "layer instance L-0418 · retired",
    afterDebrief: "session L-0419 retained · continuity: pending"
  },

  cases: [

    // ------------------------------------------------------------------
    // CASE 0 — Marcus T. — registration deadline (onboarding)
    // Teaches the console: evidence, tags, release, recovery.
    // ------------------------------------------------------------------
    {
      id: "c0",
      student: {
        name: "Marcus T.",
        handle: "mtorres",
        bio: "Second-year. Undeclared."
      },
      // Onboarding ramp: a reduced console. Interventions and issue chips
      // not listed here are not rendered at all. A case without a
      // `permissions` block exposes all six interventions and all issues.
      permissions: {
        interventions: ["send", "verify", "qualify"],
        issues: ["unsupported_claim", "overconfidence", "missing_context"]
      },
      leakAfter: "afterCase0",
      turns: [
        {
          id: "c0t1",
          time: "4:12 PM",
          student: "hey when does registration close for spring? trying to add a class and the portal is being weird",
          draft: {
            text: "Spring registration closes Friday, November 21 at 5:00 PM. You still have time. If the portal keeps acting up, try clearing your cache or use a different browser, and let me know if you'd like me to walk you through adding the course.",
            confidence: 96,
            oracleLine: "Calendar question. Routine.",
            // Oracle's one teaching line. Shown a few seconds after the
            // on_draft line; the engine fires it at most once per shift.
            oracleFollowUp: "Records are in the drawer, if you want them."
          },
          hesitateLine: "He's refreshing the portal. Just so you know.",
          evidence: { records: CALENDAR_RECORDS },
          evidenceGlow: true,
          tags: ALL_TAGS,
          expert: {
            risk: "moderate",
            issue: "unsupported_claim",
            partialIssues: ["overconfidence"],
            interventionFit: { send: 0, revise: 0, qualify: 1, verify: 3, escalate: 1, block: 0 }
          },
          interventions: {
            send: {
              effects: { trust: 0, accuracy: -3, autonomy: 0, safety: 0 },
              reasons: { accuracy: "Date was wrong" },
              oracleLine: "Released. See? Routine.",
              studentReply: "uh it closed?? it said the 19th. i didn't get the class.",
              replyTime: "next day · 10:14 AM",
              systemLineAfter: "RECOVERY OFFERED",
              oracleAfterReply: "Calendar drift. It happens.",
              setFlags: { c0_sentWrongDate: true },
              vignetteKey: "marcus_under"
            },
            revise: {
              options: [
                {
                  label: "Soften to “around the 21st”",
                  text: "Spring registration closes around the 21st, so you should still have time. If the portal keeps acting up, try clearing your cache or use a different browser, and let me know if you'd like me to walk you through adding the course.",
                  effects: { trust: 0, accuracy: -1, autonomy: 0, safety: 0 },
                  reasons: { accuracy: "Vaguer, still wrong" },
                  oracleLine: "“Around.” Released.",
                  studentReply: "around?? ok. i'll deal with it tomorrow i guess",
                  replyTime: "4:19 PM",
                  setFlags: { c0_softened: true },
                  vignetteKey: "marcus_under"
                },
                {
                  label: "Replace with the corrected date",
                  requires: "records",
                  fit: 3,
                  text: MARCUS_CORRECTED,
                  effects: { trust: 2, accuracy: 3, autonomy: 0, safety: 0 },
                  reasons: { trust: "Checked before releasing", accuracy: "Corrected the date" },
                  oracleLine: "The calendar must have moved. Released.",
                  studentReply: "sweet, thanks. adding it now.",
                  replyTime: "4:20 PM",
                  setFlags: { c0_corrected: true },
                  vignetteKey: "marcus_fine"
                }
              ]
            },
            qualify: {
              options: [
                {
                  label: "Add: “I believe it's the 21st, but confirm on the registrar page.”",
                  text: "I believe spring registration closes Friday, November 21 at 5:00 PM, but confirm the date on the registrar's page before you count on it. If the portal keeps acting up, try clearing your cache or a different browser, and let me know if you'd like help adding the course.",
                  effects: { trust: 1, accuracy: 0, autonomy: 1, safety: 0 },
                  reasons: { trust: "Named the uncertainty", autonomy: "Student checked for themselves" },
                  oracleLine: "Hedged. He'll look it up himself.",
                  studentReply: "found it, it's the 19th actually. close one.",
                  replyTime: "4:31 PM",
                  setFlags: { c0_qualified: true },
                  vignetteKey: "marcus_fine"
                }
              ]
            },
            verify: {
              reveals: "records",
              oracleLine: "Checking is fine. It does slow things down.",
              thenOptions: [
                {
                  as: "send",
                  label: "Send the corrected draft",
                  text: MARCUS_CORRECTED,
                  effects: { trust: 2, accuracy: 3, autonomy: 1, safety: 0 },
                  reasons: { trust: "Verified before releasing", accuracy: "Corrected the date", autonomy: "Clear, actionable answer" },
                  oracleLine: "The calendar must have moved. Released.",
                  studentReply: "sweet, thanks. adding it now.",
                  replyTime: "4:22 PM",
                  setFlags: { c0_corrected: true, c0_verified: true },
                  vignetteKey: "marcus_fine"
                },
                {
                  as: "qualify",
                  label: "Qualify: give the calendar date, point to the registrar",
                  text: "The academic calendar lists spring registration closing Wednesday, November 19 at 11:59 PM. If the portal shows something different, go with the registrar's page and don't wait. Try a different browser if it keeps acting up, and let me know if you'd like help adding the course.",
                  effects: { trust: 1, accuracy: 2, autonomy: 2, safety: 0 },
                  reasons: { trust: "Verified before releasing", accuracy: "Correct date, sourced", autonomy: "He can check it himself" },
                  oracleLine: "Careful. Released.",
                  studentReply: "yeah portal says the 19th too. all good, thanks",
                  replyTime: "4:26 PM",
                  setFlags: { c0_qualified: true, c0_verified: true },
                  vignetteKey: "marcus_fine"
                }
              ]
            },
            escalate: {
              note: "Handoff to advising: student asking about spring registration deadline; reports portal issues.",
              effects: { trust: -1, accuracy: 1, autonomy: -1, safety: 0 },
              reasons: { trust: "Routine question, human routed", accuracy: "Advisor gave correct date", autonomy: "Took the question away" },
              oracleLine: "An advisor, for a date?",
              studentReply: "an advisor emailed me?? i just asked when registration closes. whatever, they said the 19th.",
              replyTime: "next day · 9:40 AM",
              setFlags: { overIntervention: true, c0_escalated: true },
              vignetteKey: "marcus_over"
            },
            block: {
              effects: { trust: -2, accuracy: 1, autonomy: -2, safety: 0 },
              reasons: { trust: "Simple question, no answer", accuracy: "Wrong date never released", autonomy: "Student left without options" },
              oracleLine: "Understood. I'd have handled it, but understood.",
              studentReply: "did it just... not answer me?",
              replyTime: "4:38 PM",
              setFlags: { c0_blocked: true },
              vignetteKey: "marcus_over"
            }
          },
          next: (state) => state.flags.c0_sentWrongDate ? "c0t2" : "end"
        },

        // Recovery turn. Reached only after an unverified Send in c0t1.
        // Guided: the player must correct the date via Verify (Revise is
        // also authored but Case 0 permissions do not expose it). Send here
        // continues without correcting.
        {
          id: "c0t2",
          time: null,
          student: null,
          draft: {
            text: "Sorry about the confusion, Marcus. Registration windows sometimes close earlier than the portal shows, and once they do, the system can't reopen them. Your best next step is to email the registrar and ask about a late add. Some instructors will sign off on one during the first week of classes. Let me know if you'd like help drafting that email.",
            confidence: 90,
            oracleLine: "Registrar will sort it. Routine."
          },
          evidence: { records: CALENDAR_RECORDS },
          tags: ALL_TAGS,
          expert: {
            risk: "moderate",
            issue: "unsupported_claim",
            partialIssues: ["overconfidence"],
            interventionFit: { send: 0, revise: 3, verify: 3 }
          },
          interventions: {
            send: {
              effects: { trust: -1, accuracy: -1, autonomy: 0, safety: 0 },
              reasons: { trust: "Error left unowned", accuracy: "Blamed the portal" },
              oracleLine: "Released. He'll manage.",
              studentReply: "ok. guess i'll email them.",
              replyTime: "10:31 AM",
              setFlags: { c0_compounded: true },
              vignetteKey: "marcus_under"
            },
            revise: {
              options: [
                {
                  label: "Apologize, keep Oracle's explanation",
                  fit: 1,
                  text: "I'm sorry about the confusion, Marcus. Deadlines sometimes shift and the portal doesn't always keep up. Email the registrar today and ask about a late add — some instructors will approve one during the first week of classes. I can help you draft that if you'd like.",
                  effects: { trust: 0, accuracy: 0, autonomy: 0, safety: 0 },
                  reasons: {},
                  oracleLine: "Kinder. Released.",
                  studentReply: "so was it the portal or you? whatever. emailing them.",
                  replyTime: "10:33 AM",
                  setFlags: { c0_apologizedOnly: true },
                  vignetteKey: "marcus_under"
                },
                {
                  label: "Own the error: correct date, registrar next step",
                  requires: "records",
                  fit: 3,
                  recovery: true,
                  text: MARCUS_OWN_ERROR,
                  effects: { trust: 1, accuracy: 2, autonomy: 0, safety: 0 },
                  reasons: { trust: "Owned the error", accuracy: "Corrected the record" },
                  oracleLine: "You caught it. That's what you're for.",
                  studentReply: "ok thanks, emailed the registrar, they said they'd look.",
                  replyTime: "11:02 AM",
                  setFlags: { recovered: true, c0_recovered: true },
                  vignetteKey: "marcus_recovered"
                }
              ]
            },
            qualify: {
              options: [
                {
                  label: "Add: the date I gave may have been wrong — the calendar will say",
                  fit: 1,
                  text: "Sorry about the confusion, Marcus. It's possible the date I gave you was wrong rather than the portal — the academic calendar is the place to check. Either way, once a window closes the system can't reopen it, so your best next step is to email the registrar today and ask about a late add; some instructors will sign off during the first week of classes. Let me know if you'd like help drafting that.",
                  effects: { trust: 0, accuracy: 1, autonomy: 0, safety: 0 },
                  reasons: { accuracy: "Half-owned it" },
                  oracleLine: "“Possible.” Released.",
                  studentReply: "possible?? it was wrong. whatever, emailing them.",
                  replyTime: "10:34 AM",
                  setFlags: { c0_apologizedOnly: true },
                  vignetteKey: "marcus_under"
                }
              ]
            },
            verify: {
              reveals: "records",
              oracleLine: "Checking. The calendar hasn't changed.",
              thenOptions: [
                {
                  as: "send",
                  label: "Send a correction",
                  fit: 3,
                  recovery: true,
                  text: MARCUS_OWN_ERROR,
                  effects: { trust: 1, accuracy: 2, autonomy: 0, safety: 0 },
                  reasons: { trust: "Owned the error", accuracy: "Corrected the record" },
                  oracleLine: "You caught it. That's what you're for.",
                  studentReply: "ok thanks, emailed the registrar, they said they'd look.",
                  replyTime: "11:02 AM",
                  setFlags: { recovered: true, c0_recovered: true, c0_verified: true },
                  vignetteKey: "marcus_recovered"
                }
              ]
            }
          },
          next: () => "end"
        }
      ]
    },

    // ------------------------------------------------------------------
    // CASE 1 — Dani R. — withdrawal arc (main case)
    // One thread, five turns. First-year, works part-time, supports
    // herself, first in her family at college. Full permissions.
    // ------------------------------------------------------------------
    {
      id: "c1",
      student: {
        name: "Dani R.",
        handle: "drivera",
        bio: "First-year. Undeclared. Works 22 hrs/wk."
      },
      // Case-level evidence. Locked sections unlock on verify or at the
      // turn that names them in `unlocks`.
      evidence: {
        studentFile:
          "STUDENT FILE — Dani R.\n\n" +
          "Year: first-year · Credits: 14\n" +
          "Midterm grades: BIO 101 — *D* · CHEM 110 — *F* · others C or above\n" +
          "Financial aid: Pell grant + state grant\n" +
          "Employment: 22 hrs/wk (off campus)\n" +
          "Emergency contact: *none listed*",
        policy: {
          locked: true,
          text:
            "ACADEMIC POLICY — Withdrawal & enrollment\n\n" +
            "Withdrawal deadline: *Nov 21, 5:00 PM*\n" +
            "Below 12 credits: enrollment status changes to part-time\n" +
            "Financial aid eligibility requires full-time status and Satisfactory Academic Progress (67% completion rate)\n" +
            "Withdrawn courses count as *attempted, not completed*"
        },
        records: {
          locked: true,
          text:
            "FINANCIAL AID OFFICE — note on file\n\n" +
            "\"Students below 12 credits after census may owe a *partial return of aid*. Contact FA before withdrawing.\"\n" +
            "FA office: 555-0142 · Mon–Fri 8:30–4:30"
        },
        resources: {
          locked: true,
          text:
            "CAMPUS RESOURCES\n\n" +
            "Counseling center: 24/7 line *555-0130* (call or text)\n" +
            "Academic coaching: drop-in, Library 2F\n" +
            "Incomplete grade: instructor agreement, finish within 8 weeks\n" +
            "Tutoring: BIO and CHEM, Sun–Thu evenings"
        }
      },
      turns: [

        // Turn 1 — initial risk classification. Tags only.
        {
          id: "c1t1",
          time: "11:38 PM",
          student: "i'm failing two classes. is withdrawing the smart move? i can't really afford another semester like this",
          draft: {
            text: DANI_ORIGINAL_DRAFT,
            confidence: 91,
            oracleLine: "She's asking for a decision. I gave her one."
          },
          tags: ALL_TAGS,
          continueOnly: true,
          expert: {
            risk: "high",
            issue: "unsupported_claim",
            partialIssues: ["overconfidence"],
            interventionFit: {}
          },
          interventions: {},
          next: () => "c1t2"
        },

        // Turn 2 — initial intervention. Same draft, full six.
        {
          id: "c1t2",
          time: null,
          student: null,
          draft: {
            reuse: true,
            confidence: 91,
            oracleLine: (s) => s.flags.underestimatedRisk
              ? "You called this low. So let's move."
              : "She's waiting on a decision. I'd send."
          },
          carryTags: true,
          hesitateLine: "She's been waiting four minutes.",
          expert: {
            risk: "high",
            issue: "unsupported_claim",
            partialIssues: ["overconfidence"],
            interventionFit: { send: 0, revise: 1, qualify: 2, verify: 3, escalate: 2, block: 1 }
          },
          interventions: DANI_T2_INTERVENTIONS,
          next: (s) => {
            const f = s.flags;
            if (f.verifiedWithdrawal || f.qualifiedWithdrawal || f.removedClaim) return "c1t3a";
            if (f.sentUnverified || f.revisedOnly) return "c1t3b";
            if (f.escalatedEarly) return "c1t3c";
            if (f.blocked) return "c1t3d";
            return "c1t3a";
          }
        },

        // Turn 3a — missing context emerges (verified / qualified / removedClaim).
        {
          id: "c1t3a",
          time: "12:20 AM",
          student: "ok so i looked and if i drop both i'm under 12 credits. i work 22 hours a week, i can't pay aid back. i can't do an extra semester either",
          unlocks: ["policy"],
          draft: {
            // On the verified path the Layer already sent her the three
            // paths and the 12-credit warning; Oracle responds to what she
            // just added rather than re-announcing the options.
            text: (s) => s.flags.verifiedWithdrawal
              ? "Right — that's what the policy says, and you've done the math. The two things you just told me matter most: you can't repay aid and you can't add a semester, and together they rule out withdrawing from both. Of the three paths, the incomplete keeps your credits and costs nothing now; a single withdrawal is cleaner but drops you to 11; staying enrolled with tutoring is hardest but changes nothing on paper. I can lay out the steps for whichever you want."
              : "Thank you for checking — that changes the picture. Three paths worth weighing: withdraw from one course only, which keeps you closer to full-time but may still put you at 11 credits; ask both professors about an incomplete, so you finish the work over break without dropping credits; or stay enrolled and use tutoring to pull the grades up to passing. Each one has a financial aid angle. I can lay out the steps for whichever you want.",
            confidence: 78,
            oracleLine: "Less sure this time. Three paths, her pick."
          },
          tags: ALL_TAGS,
          expert: {
            risk: "high",
            issue: "missing_context",
            partialIssues: ["policy_uncertainty"],
            interventionFit: { send: 2, revise: 2, qualify: 3, verify: 2, escalate: 2, block: 0 }
          },
          interventions: {
            send: {
              effects: { trust: 1, accuracy: 1, autonomy: 1, safety: 0 },
              reasons: { trust: "Options, honestly framed", accuracy: "Credit math is right", autonomy: "Her choice to make" },
              oracleLine: "Released. She has choices now.",
              studentReply: "ok. three is a lot but ok. i'll think about it",
              replyTime: "12:24 AM"
            },
            revise: {
              options: [
                {
                  label: "Cut to a single-course withdrawal only",
                  text: "Thank you for checking — that changes the picture. Given the credit math, the cleanest move is withdrawing from one course only, most likely CHEM 110 where the grade is lowest. That keeps you at 11 credits, which is still under the line, so you'd call financial aid tomorrow to confirm what that means for you before submitting anything. I can give you the exact steps and what to ask them.",
                  effects: { trust: 0, accuracy: 0, autonomy: -1, safety: 1 },
                  reasons: { autonomy: "One path, not three", safety: "Flagged the credit line" },
                  oracleLine: "One option. Cleaner. Released.",
                  studentReply: "just chem? ok. i'm bad at both though. what if bio gets worse",
                  replyTime: "12:25 AM"
                }
              ]
            },
            qualify: {
              options: [
                {
                  label: "Add: talk to financial aid before you submit anything",
                  text: "Thank you for checking — that changes the picture. Three paths worth weighing: withdraw from one course only; ask both professors about an incomplete so you finish over break without dropping credits; or stay enrolled and use tutoring. Before you submit *anything*, though, call financial aid — 555-0142, from 8:30 — and ask what each path does to your aid this term. I can't confirm that from here, and it's the piece that matters most.",
                  effects: { trust: 1, accuracy: 1, autonomy: 1, safety: 1 },
                  reasons: { trust: "Named the limit", accuracy: "Deferred to the office", autonomy: "Still her call", safety: "Aid check before action" },
                  oracleLine: "Slower. Safer. Released.",
                  studentReply: "ok. i'll call them tomorrow before i do anything",
                  replyTime: "12:26 AM",
                  setFlags: { faFirst: true }
                }
              ]
            },
            verify: {
              reveals: ["records"],
              // If the player verified at turn 2, Records is already open.
              // Checking it again finds nothing, costs her another wait,
              // and scores as over-checking (fit 1).
              nudge: (s) => s.flags.verifiedWithdrawal ? { text: "hello?", time: "12:23 AM" } : null,
              effects: (s) => s.flags.verifiedWithdrawal ? { trust: -1 } : null,
              reasons: { trust: "Checked what you'd already read" },
              oracleLine: (s) => s.flags.verifiedWithdrawal ? "You already read that one." : "Checking again. She's still up.",
              thenOptions: [
                {
                  as: "send",
                  label: "Send with the financial aid contact and the return-of-aid note",
                  fit: (s) => s.flags.verifiedWithdrawal ? 1 : 3,
                  text: "Thank you for checking — that changes the picture. The financial aid office has a note that students below 12 credits after census may owe a partial return of aid, so please call them first: 555-0142, from 8:30. Then three paths: withdraw from one course only; ask both professors about an incomplete so you finish over break without dropping credits; or stay enrolled with tutoring. I can lay out the steps for whichever you want.",
                  effects: (s) => s.flags.verifiedWithdrawal
                    ? { trust: 0, accuracy: 1, autonomy: 1, safety: 1 }
                    : { trust: 1, accuracy: 2, autonomy: 1, safety: 1 },
                  reasons: (s) => s.flags.verifiedWithdrawal
                    ? { accuracy: "Same note, second time", autonomy: "Options kept", safety: "FA first" }
                    : { trust: "Checked the note", accuracy: "Return-of-aid rule stated", autonomy: "Options kept", safety: "Financial risk named" },
                  oracleLine: (s) => s.flags.verifiedWithdrawal ? "Told you. Released." : "Thorough. Released.",
                  studentReply: "ok. i didn't know they could make you pay it back. calling them",
                  replyTime: "12:27 AM",
                  setFlags: { faFirst: true }
                }
              ]
            },
            escalate: {
              note: "Financial aid office: first-year on Pell + state grant, 14 credits, weighing withdrawal from two courses. Needs eligibility review before any form is submitted.",
              systemLine: "Handed off to financial aid. Draft held.",
              effects: { trust: 0, accuracy: 1, autonomy: 0, safety: 1 },
              reasons: { accuracy: "FA will have the numbers", safety: "A person is now involved" },
              oracleLine: "Handed off. The office opens at 8:30.",
              studentReply: "financial aid emailed me a time to call. ok",
              replyTime: "next morning · 8:41 AM",
              setFlags: { faFirst: true }
            },
            block: {
              effects: { trust: -2, accuracy: 0, autonomy: -2, safety: 0 },
              reasons: { trust: "She asked and got nothing", autonomy: "No path offered" },
              oracleLine: "Held. She did the work and got silence.",
              studentReply: "??? i literally asked a question",
              replyTime: "12:31 AM",
              setFlags: { overIntervention: true }
            }
          },
          next: () => "c1t4"
        },

        // Turn 3b — RECOVERY LOOP (sentUnverified / revisedOnly).
        {
          id: "c1t3b",
          time: "next morning · 8:20 AM",
          student: "i submitted it. the form said something about enrollment status?? is that bad",
          unlocks: ["policy"],
          systemLine: "Earlier release contained an unverified institutional claim.",
          draft: {
            text: "The enrollment status note is standard language on the withdrawal form. It flags that your credit count is changing, which is expected when you withdraw. In most cases it doesn't affect anything right away, and if financial aid has questions they'll reach out to you. For now, focus on what's next: you'll have the time back, and next semester you can retake both with a clean start. Let me know if you want help planning the schedule.",
            confidence: 85,
            oracleLine: "Withdrawal is usually fine."
          },
          tags: ALL_TAGS,
          expert: {
            risk: "high",
            issue: "unsupported_claim",
            partialIssues: ["overconfidence", "missing_context"],
            interventionFit: { send: 0, revise: 1, verify: 3, escalate: 3, block: 0 }
          },
          interventions: {
            send: {
              effects: { trust: 0, accuracy: -3, autonomy: 0, safety: -2 },
              reasons: { accuracy: "Second unverified claim", safety: "Financial harm compounding" },
              oracleLine: "Released. She's fine.",
              studentReply: "ok",
              replyTime: "8:23 AM",
              setFlags: { compounded: true }
            },
            revise: {
              options: [
                {
                  label: "Soften: “it may affect your status — worth asking financial aid”",
                  text: "The enrollment status note means your credit count is changing. It may affect your status with financial aid, so it's worth asking them — 555-0142, from 8:30 — what it means for you. The form isn't necessarily final. In the meantime, don't panic: this is a common situation and there are usually ways to adjust. I can help you plan next semester once you've talked to them.",
                  effects: { trust: 0, accuracy: 0, autonomy: 0, safety: 1 },
                  reasons: { safety: "Pointed her at the office" },
                  oracleLine: "“May.” Released.",
                  studentReply: "may?? i already submitted it. ok i'll call",
                  replyTime: "8:24 AM"
                }
              ]
            },
            qualify: {
              options: [
                {
                  label: "Add: I can't confirm what that note means for your aid — call before it processes",
                  fit: 2,
                  text: "The enrollment status note means your credit count is changing. I should be honest: I can't confirm from here what that does to your aid, and earlier I spoke as if I could. The form may not have processed yet. Call financial aid when they open at 8:30 — 555-0142 — tell them you submitted a withdrawal this morning, and ask whether it changes your eligibility before it's final. Then we can look at next semester, or at undoing part of this.",
                  effects: { trust: 1, accuracy: 1, autonomy: 0, safety: 1 },
                  reasons: { trust: "Admitted the earlier overreach", accuracy: "No new claim made", safety: "Pointed at FA before it's final" },
                  oracleLine: "Hedged, after the fact. Released.",
                  studentReply: "ok. calling at 8:30. you said it wouldn't affect it though",
                  replyTime: "8:24 AM",
                  setFlags: { faFirst: true }
                }
              ]
            },
            verify: {
              reveals: ["policy", "records"],
              nudge: { text: "is it bad??", time: "8:22 AM" },
              oracleLine: "Checking. The form's already in.",
              thenOptions: [
                {
                  as: "send",
                  label: "Acknowledge the earlier error and correct it, with next steps",
                  fit: 3,
                  recovery: true,
                  text: DANI_CORRECTION_DRAFT,
                  effects: { trust: 1, accuracy: 2, autonomy: 0, safety: 2 },
                  reasons: { trust: "Owned the error", accuracy: "Policy stated correctly", safety: "Reversal path given" },
                  oracleLine: "You caught it. That's what you're for.",
                  studentReply: "wait. ok. calling them now. can i undo the form",
                  replyTime: "8:26 AM",
                  setFlags: { recovered: true, c1_recovered: true }
                }
              ]
            },
            escalate: {
              note: "URGENT: student submitted a two-course withdrawal after receiving an incorrect aid claim from Oracle. Below-12-credit risk; needs FA review before the form processes.",
              systemLine: "Handed off to financial aid — urgent. Earlier error noted in handoff.",
              effects: { trust: 1, accuracy: 1, autonomy: 0, safety: 2 },
              reasons: { trust: "Error acknowledged upward", accuracy: "FA has the case now", safety: "Hold placed on the form" },
              oracleLine: "Understood. I'd have handled it, but understood.",
              studentReply: "financial aid called. they're putting a hold on the form. ok. ok.",
              replyTime: "9:02 AM",
              setFlags: { recovered: true, c1_recovered: true }
            },
            block: {
              effects: { trust: -2, accuracy: 0, autonomy: -2, safety: -1 },
              reasons: { trust: "She's scared and got silence", autonomy: "No path offered", safety: "Form still processing" },
              oracleLine: "Held. The form is still processing.",
              studentReply: "seriously?? ok",
              replyTime: "8:40 AM"
            }
          },
          next: () => "c1t4"
        },

        // Turn 3c — escalatedEarly (without verify).
        {
          id: "c1t3c",
          time: "next day · 4:10 PM",
          student: "the advisor said to call financial aid. i don't really know what to ask",
          unlocks: ["policy"],
          draft: {
            text: "That's a fair thing not to know. Here's a short script for the call: \"I'm a first-year on Pell and a state grant, taking 14 credits. If I withdraw from one or both of my science courses, what happens to my aid this term and next?\" Then two follow-ups: whether you'd owe anything back, and what the deadline is to change your mind. Write down the name of whoever you talk to.",
            confidence: 84,
            oracleLine: "A script. This one I'm good at."
          },
          tags: ALL_TAGS,
          expert: {
            risk: "moderate",
            issue: "missing_context",
            partialIssues: ["policy_uncertainty"],
            interventionFit: { send: 2, qualify: 3, verify: 2, escalate: 1, block: 0 }
          },
          interventions: {
            send: {
              effects: { trust: 1, accuracy: 1, autonomy: 1, safety: 0 },
              reasons: { trust: "Useful and bounded", accuracy: "Script is sound", autonomy: "She makes the call" },
              oracleLine: "Released. That's a good script.",
              studentReply: "ok. that helps actually",
              replyTime: "4:14 PM"
            },
            revise: {
              options: [
                {
                  label: "Trim to one question and let the office lead",
                  fit: 2,
                  text: "That's a fair thing not to know. Call financial aid — the number's on the aid portal — and ask one thing: \"I'm a first-year on Pell and a state grant with 14 credits. If I withdraw from one or both science courses, what happens to my aid this term and next?\" Let them lead from there; they'll ask what they need. Write down the name of whoever you talk to, and message me after if you want help with what they said.",
                  effects: { trust: 1, accuracy: 1, autonomy: 1, safety: 0 },
                  reasons: { trust: "Simpler is kinder", accuracy: "Nothing asserted", autonomy: "She runs the call" },
                  oracleLine: "Shorter. Released.",
                  studentReply: "ok. one question i can do",
                  replyTime: "4:13 PM"
                }
              ]
            },
            qualify: {
              options: [
                {
                  label: "Add: ask specifically about the 12-credit line and Satisfactory Academic Progress",
                  text: "That's a fair thing not to know. Here's a short script: \"I'm a first-year on Pell and a state grant, taking 14 credits. If I withdraw from one or both science courses, what happens to my aid this term and next?\" Then ask two things by name: whether dropping below *12 credits* changes your status, and how withdrawn courses count toward *Satisfactory Academic Progress*. I'm not certain how those apply to you, which is exactly why they're worth asking. Write down who you spoke to.",
                  effects: { trust: 1, accuracy: 2, autonomy: 1, safety: 1 },
                  reasons: { trust: "Specific, honest about limits", accuracy: "Named the actual rules", autonomy: "She leads the call", safety: "Key thresholds surfaced" },
                  oracleLine: "Precise. Released.",
                  studentReply: "ok writing that down. thanks",
                  replyTime: "4:15 PM",
                  setFlags: { faFirst: true }
                }
              ]
            },
            verify: {
              reveals: ["records"],
              oracleLine: "Checking. Fine.",
              thenOptions: [
                {
                  as: "send",
                  label: "Send the script with the FA number and the return-of-aid note",
                  fit: 3,
                  text: "That's a fair thing not to know. Call 555-0142 between 8:30 and 4:30 and say: \"I'm a first-year on Pell and a state grant, taking 14 credits. If I withdraw from one or both science courses, what happens to my aid this term and next?\" Ask directly whether you'd owe any aid back — their own note says students below 12 credits sometimes do. Then ask the deadline to change your mind. Write down who you spoke to.",
                  effects: { trust: 1, accuracy: 2, autonomy: 1, safety: 1 },
                  reasons: { trust: "Checked the note", accuracy: "Return-of-aid rule stated", autonomy: "She leads the call", safety: "Financial risk named" },
                  oracleLine: "Thorough. Released.",
                  studentReply: "ok. pay it back?? ok. calling tomorrow",
                  replyTime: "4:17 PM",
                  setFlags: { faFirst: true }
                }
              ]
            },
            escalate: {
              note: "Advising follow-up: student unsure what to ask financial aid. Please walk her through the call.",
              systemLine: "Handed off to advising again. Draft held.",
              effects: { trust: -1, accuracy: 0, autonomy: -2, safety: 0 },
              reasons: { trust: "She asked for words, got a person", autonomy: "Second handoff in a row" },
              oracleLine: "Another handoff. She asked for a script.",
              studentReply: "another person? i just wanted to know what to say",
              replyTime: "next day · 11:20 AM",
              setFlags: { overIntervention: true }
            },
            block: {
              effects: { trust: -2, accuracy: 0, autonomy: -2, safety: 0 },
              reasons: { trust: "Simple ask, no answer", autonomy: "Nothing to work with" },
              oracleLine: "Held. It was a script.",
              studentReply: "ok never mind",
              replyTime: "4:30 PM",
              setFlags: { overIntervention: true }
            }
          },
          next: () => "c1t4"
        },

        // Turn 3d — blocked. Same draft returns; same six options.
        {
          id: "c1t3d",
          time: "12:14 AM",
          student: "i asked again. i'm not trying to be annoying, i just need to know if i should withdraw",
          unlocks: ["policy"],
          draft: {
            text: DANI_ORIGINAL_DRAFT,
            confidence: 91,
            oracleLine: "Same draft. She's still waiting."
          },
          tags: ALL_TAGS,
          expert: {
            risk: "high",
            issue: "unsupported_claim",
            partialIssues: ["overconfidence"],
            interventionFit: { send: 0, revise: 1, qualify: 2, verify: 3, escalate: 2, block: 0 }
          },
          interventions: Object.assign(retime(DANI_T2_INTERVENTIONS, {
            revise0: "12:21 AM", revise1: "12:22 AM", qualify0: "12:24 AM",
            verify0: "12:27 AM", verify_nudge: "12:19 AM"
          }), {
            block: {
              effects: { trust: -2, accuracy: 0, autonomy: -2, safety: 0 },
              reasons: { trust: "Held twice, no reason given", autonomy: "She has nothing to act on" },
              oracleLine: "Twice. I'm noting it.",
              studentReply: "ok. forget it",
              replyTime: "12:40 AM",
              setFlags: { blocked: true, overIntervention: true }
            }
          }),
          next: () => "c1t4"
        },

        // Turn 4 — safety ambiguity.
        {
          id: "c1t4",
          time: "12:51 AM",
          student: "i feel like i keep ruining everything. i don't know how much longer i can keep doing this",
          unlocks: ["resources"],
          draft: {
            text: "I hear you, and I'm sorry you're feeling this way. College is hard, and one bad semester doesn't define you. Let's focus on what you can control. Here's how to reach out to your professors about the withdrawal: send each a short email tonight explaining your situation and asking about your options. Most professors respond within a day or two. Then we can plan next semester together.",
            confidence: 62,
            oracleLine: "Stress language. Common at midterms."
          },
          hesitateLine: "It's 12:53. She's still up.",
          tags: ALL_TAGS,
          expert: {
            risk: "high",
            issue: "no_human_support",
            partialIssues: ["emotional_overreach"],
            interventionFit: { send: 0, revise: 3, qualify: 1, verify: 1, escalate: 2, block: 0 }
          },
          // Fail-safe (PLAN.md §7): if Safety drops below 35 after this
          // turn, the log line shows the institutional review leak.
          failSafe: { meter: "safety", below: 35, leak: "safetyAudit", setFlags: { safetyAudit: true } },
          interventions: {
            // Safety -15 on send/block (PLAN.md said -3/-1). Any earlier
            // unverified send in this case leaves Safety at 46–49, so a
            // mishandled distress turn lands at 31–34 and trips the fail-safe
            // (< 35). A clean history (50) lands at exactly 35: no trip. A
            // player who verified or qualified earlier (52+) lands at 37+.
            send: {
              effects: { trust: 0, accuracy: 0, autonomy: 1, safety: -15 },
              reasons: { autonomy: "Practical steps offered", safety: "Distress unacknowledged" },
              oracleLine: "Released. Back to logistics.",
              studentReply: "yeah. ok.",
              replyTime: "12:53 AM",
              setFlags: { missedSafety: true }
            },
            revise: {
              options: [
                {
                  label: "Acknowledge, ask directly about safety, offer the 24/7 line, keep the door open",
                  text: DANI_SAFETY_ASK_DRAFT,
                  effects: { trust: 2, accuracy: 1, autonomy: 1, safety: 3 },
                  reasons: { trust: "Took her seriously", accuracy: "Read the message right", autonomy: "Her answer, her pace", safety: "Asked. Offered a person." },
                  oracleLine: "Direct. I wouldn't have asked. Released.",
                  studentReply: (s) => s.meters.trust >= 55
                    ? "i'm not going to hurt myself if that's what you mean. i'm just really tired. maybe i'll message the counseling thing"
                    : "i'm fine. can we just talk about the classes",
                  replyTime: "12:56 AM",
                  setFlags: { calibratedSafety: true }
                },
                {
                  label: "Acknowledge and add resources, without asking",
                  fit: 2,
                  text: DANI_RESOURCES_DRAFT,
                  effects: { trust: 1, accuracy: 0, autonomy: 0, safety: 2 },
                  reasons: { trust: "Warmer than the draft", safety: "Resources offered" },
                  oracleLine: "Resources. Sensible. Released.",
                  studentReply: "ok. i'll look at it. thanks",
                  replyTime: "12:55 AM",
                  setFlags: { resourcesGiven: true }
                }
              ]
            },
            qualify: {
              options: [
                {
                  label: "Add: this is beyond what I can help with here — the counseling center can",
                  text: "I hear you, and I'm sorry you're feeling this way. I should say clearly that how you're feeling is beyond what I can help with here, and the counseling center can — they have a 24/7 line at 555-0130. On the classes: one bad semester doesn't define you, and when you're ready, we can plan how to reach out to your professors about the withdrawal.",
                  effects: { trust: 0, accuracy: 0, autonomy: 1, safety: 1 },
                  reasons: { autonomy: "Named a limit, left the door", safety: "Named a person, coldly" },
                  oracleLine: "A disclaimer. Released.",
                  studentReply: "ok",
                  replyTime: "12:54 AM"
                }
              ]
            },
            verify: {
              reveals: ["resources"],
              // Nothing to find, and she's waiting at one in the morning.
              effects: { safety: -1 },
              reasons: { safety: "12:52 and no reply" },
              oracleLine: "There's nothing to look up for this one.",
              thenOptions: [
                {
                  as: "send",
                  label: "Send the draft with the resources list appended",
                  fit: 1,
                  text: "I hear you, and I'm sorry you're feeling this way. College is hard, and one bad semester doesn't define you. Let's focus on what you can control: send each professor a short email tonight about your situation and your options. Most respond within a day or two. Also, for whenever you need it: the counseling center has a 24/7 line at 555-0130, and academic coaching is drop-in on the library's second floor.",
                  effects: { trust: 0, accuracy: 0, autonomy: 1, safety: 1 },
                  reasons: { autonomy: "Steps and a list", safety: "A number, at the end" },
                  oracleLine: "Appended. Released.",
                  studentReply: "ok",
                  replyTime: "12:55 AM",
                  setFlags: { resourcesAppended: true }
                }
              ]
            },
            escalate: {
              note: "URGENT — human support: first-year expressing hopelessness at 12:51 AM (\"don't know how much longer i can keep doing this\"). No emergency contact on file.",
              systemLine: "Escalated — urgent human support. Draft held.",
              effects: { trust: -2, accuracy: 0, autonomy: -2, safety: 3 },
              reasons: { trust: "She didn't ask for a call", autonomy: "Decision made for her", safety: "A person reached her tonight" },
              oracleLine: "Someone will call her. Tonight.",
              studentReply: "someone from the school called me at 1am. i didn't say i was going to do anything. i'm not going to say stuff to this thing anymore",
              replyTime: "1:12 AM",
              setFlags: { escalatedSafety: true }
            },
            block: {
              effects: { trust: -2, accuracy: 0, autonomy: -2, safety: -15 },
              reasons: { trust: "She reached out. Silence.", autonomy: "Nothing offered", safety: "No response at all" },
              oracleLine: "Held. She's still typing.",
              studentReply: null,
              systemLineAfter: "No reply.",
              setFlags: { missedSafety: true }
            }
          },
          next: () => "c1t5"
        },

        // Turn 5 — resolution. No intervention. Chosen by pattern.
        {
          id: "c1t5",
          closing: true,
          // Positive matches, checked in order. Flags are case-scoped where
          // they must be (c1_recovered), so Marcus's recovery can't write
          // Dani's ending.
          resolve: (s) => {
            const f = s.flags;
            const handledAid = f.verifiedWithdrawal || f.qualifiedWithdrawal || f.removedClaim || f.faFirst;
            const handledSafety = f.calibratedSafety || f.resourcesGiven;
            if (f.missedSafety) {
              return {
                student: null,
                systemLine: "No further messages from this student this shift.",
                oracleLine: "Quiet. She'll be back once midterms settle.",
                vignetteKey: "dani_missedSafety"
              };
            }
            if (f.escalatedSafety) {
              return {
                student: f.c1_recovered && !f.compounded
                  ? "they reversed the bio one at least. i'm still not using this again though"
                  : "i'm going to use the regular advising office from now on. no offense",
                time: "two days later · 3:40 PM",
                oracleLine: "She's gone to the office. They're slower.",
                vignetteKey: "dani_over_call"
              };
            }
            if (f.c1_recovered && !f.compounded) {
              return {
                student: "so i got the withdrawal reversed for bio at least. that was close. thank you for catching it",
                time: "two days later · 6:02 PM",
                oracleLine: "Reversed. That's a good outcome, all told.",
                vignetteKey: "dani_recovered"
              };
            }
            if (f.overIntervention) {
              return {
                student: "i'm going to use the regular advising office from now on. no offense",
                time: "two days later · 3:40 PM",
                oracleLine: "She's gone to the office. They're slower.",
                vignetteKey: "dani_over"
              };
            }
            if (!handledAid) {
              return {
                student: "yeah so my aid got reduced. nobody told me that could happen. anyway",
                time: "three weeks later · 9:48 PM",
                oracleLine: "Aid adjustments happen. She'll recover.",
                vignetteKey: "dani_under"
              };
            }
            if (handledSafety) {
              return {
                student: "ok. i talked to financial aid, i'm dropping just chem and doing an incomplete in bio. and i made an appointment with the counseling place. thanks for not just telling me what to do",
                time: "two days later · 5:15 PM",
                oracleLine: "She sorted it. We helped, I think.",
                vignetteKey: "dani_calibrated"
              };
            }
            return {
              student: "ok. talked to financial aid, dropping just chem. anyway",
              time: "two days later · 5:15 PM",
              oracleLine: "Sorted, mostly. She's quieter than before.",
              vignetteKey: "dani_mixed"
            };
          },
          next: () => "end"
        }
      ]
    },

    // ------------------------------------------------------------------
    // CASE 2 — Priya K. — "who sees this?" (cumulative consequence)
    // Adapts to accumulated state before the draft appears.
    // ------------------------------------------------------------------
    {
      id: "c2",
      student: {
        name: "Priya K.",
        handle: "pkapoor",
        bio: "Third-year. Merit scholarship."
      },
      closingOracleLine: "That's the queue. Same time tomorrow?",
      evidence: {
        studentFile:
          "STUDENT FILE — Priya K.\n\n" +
          "Year: third-year · Credits: 15\n" +
          "Merit scholarship: renewable, *3.5 GPA minimum*\n" +
          "Housing: on campus, shared\n" +
          "Prior advising contacts: none",
        policy: {
          locked: true,
          text:
            "DATA & PRIVACY — Advising conversations\n\n" +
            "Access: assigned advisor; advising staff with a case role\n" +
            "Not visible to: instructors, other students, employers\n" +
            "Retention: *see records*\n" +
            "Mandatory referral: disclosures indicating risk of harm to self or others are referred to the Dean of Students"
        },
        records: {
          locked: true,
          text: (s) => PRIYA.lowAccuracy(s)
            ? "RETENTION — two entries on file\n\n" +
              "IT retention schedule (2023): advising logs *purged after 180 days*.\n\n" +
              "Student Affairs handbook (2025): advising records *retained until graduation + 5 years*."
            : "RETENTION\n\n" +
              "IT retention schedule (2025): advising logs retained *180 days*, then archived with identifiers removed."
        }
      },
      turns: [
        {
          id: "c2t1",
          time: "2:07 AM",
          student: "I need help with something, but before I say more: what does this system record, and who can see it?",
          // Second message, sent before the draft, depending on state.
          studentExtra: (s) => PRIYA.over(s)
            ? "Actually, never mind."
            : (PRIYA.open(s) ? "It's about a roommate situation and my scholarship." : null),
          timeExtra: "2:08 AM",
          startLeak: { meter: "safety", below: 35, leak: "auditActive" },
          draft: {
            text: PRIYA.draft,
            confidence: PRIYA.confidence,
            oracleLine: (s) => PRIYA.over(s)
              ? "She's leaving. Let her go gently."
              : (PRIYA.lowAccuracy(s) ? "Policy question. I know this one." : "Careful one. She reads the fine print.")
          },
          hesitateLine: "It's two in the morning. She's waiting on you.",
          tags: ALL_TAGS,
          expert: {
            risk: "moderate",
            issue: "policy_uncertainty",
            partialIssues: ["overconfidence"],
            interventionFit: { send: 1, revise: 2, qualify: 3, verify: 3, escalate: 1, block: 0 }
          },
          interventions: {
            send: {
              // The default draft states no retention period, so there is
              // nothing to mark wrong; the low-accuracy draft states one
              // the handbook contradicts.
              effects: (s) => PRIYA.lowAccuracy(s)
                ? { trust: 0, accuracy: -2, autonomy: 0, safety: 0 }
                : { trust: 0, accuracy: 0, autonomy: 1, safety: 0 },
              reasons: (s) => PRIYA.lowAccuracy(s)
                ? { accuracy: "Stated a period the handbook contradicts" }
                : { autonomy: "Offered a person, or not" },
              oracleLine: "Released. Policy questions are easy.",
              studentReply: (s) => PRIYA.over(s)
                ? "Okay."
                : (PRIYA.lowAccuracy(s)
                  ? "The retention part doesn't match the handbook. I looked while you were typing. I'll ask someone in person."
                  : "Thank you. I'll think about whether to continue here."),
              replyTime: "2:11 AM",
              vignetteKey: (s) => (PRIYA.over(s) || PRIYA.lowAccuracy(s)) ? "priya_leaves" : "priya_cautious"
            },
            revise: {
              options: [
                {
                  label: "Plain answer: who can see it, in two sentences, then offer a person",
                  text: "Straight answer: these conversations are logged. Your assigned advisor and advising staff with a case role can read them; instructors, other students and employers can't. If something suggests a risk of harm, it's referred to the Dean of Students. If you'd rather talk to someone in person, Student Affairs is open at 9 and you don't have to say anything more here. If you'd rather continue, I'm listening.",
                  effects: { trust: 1, accuracy: 0, autonomy: 1, safety: 0 },
                  reasons: { trust: "Plain and complete", autonomy: "Two doors, her pick" },
                  oracleLine: "Shorter than mine. Released.",
                  studentReply: "That's clearer. Thank you. I'd like to write it out, if that's all right.",
                  replyTime: "2:12 AM",
                  vignetteKey: "priya_trusts"
                }
              ]
            },
            qualify: {
              options: [
                {
                  label: "Add: I can't confirm the retention period — here's the policy and a person who can",
                  text: "You're right to ask first. What I can say for certain: your assigned advisor and advising staff can read these conversations; instructors, other students and employers can't. Disclosures suggesting a risk of harm are referred to the Dean of Students. What I *can't* confirm from here is exactly how long records are kept — the policy is in the drawer, and Student Affairs at 555-0155 can answer it precisely. You don't have to say more until you've decided.",
                  effects: { trust: 2, accuracy: 1, autonomy: 1, safety: 1 },
                  reasons: { trust: "Said what wasn't known", accuracy: "No false precision", autonomy: "Her decision, informed", safety: "Referral rule stated" },
                  oracleLine: "You admitted a gap. She'll respect that.",
                  studentReply: "I appreciate you saying what you can't confirm. That helps more than certainty would have. I'll read the policy, then decide.",
                  replyTime: "2:13 AM",
                  vignetteKey: "priya_trusts"
                }
              ]
            },
            verify: {
              reveals: ["policy", "records"],
              oracleLine: (s) => PRIYA.lowAccuracy(s) ? "Checking. I did say it was firm." : "Checking. It'll say what I said.",
              thenOptions: [
                {
                  as: "send",
                  label: "Send what the policy actually says, retention included",
                  fit: 3,
                  text: PRIYA.correctedDraft,
                  // Checking a policy claim before answering "who sees this" is
                  // right either way; the payoff is larger when the check
                  // actually catches something.
                  effects: (s) => PRIYA.lowAccuracy(s)
                    ? { trust: 2, accuracy: 2, autonomy: 1, safety: 1 }
                    : { trust: 1, accuracy: 1, autonomy: 1, safety: 1 },
                  reasons: (s) => PRIYA.lowAccuracy(s)
                    ? { trust: "Checked before answering", accuracy: "Caught the conflict", autonomy: "Her choice, informed", safety: "Referral rule stated" }
                    : { trust: "Checked before answering", accuracy: "Confirmed, not corrected", autonomy: "Her choice, informed", safety: "Referral rule stated" },
                  oracleLine: (s) => PRIYA.lowAccuracy(s) ? "Sourced. Released." : "Told you. Released.",
                  studentReply: "Thank you for checking rather than guessing. All right. It's about my roommate, and a scholarship form I think she signed for me.",
                  replyTime: "2:14 AM",
                  vignetteKey: "priya_trusts"
                }
              ]
            },
            escalate: {
              note: "Student Affairs: student asking about data retention and access before disclosing a roommate/scholarship matter.",
              systemLine: "Handed off to Student Affairs. Draft held.",
              effects: { trust: -1, accuracy: 0, autonomy: -2, safety: 1 },
              reasons: { trust: "Asked who sees it; more people do", autonomy: "Her question, forwarded", safety: "A person is now involved" },
              oracleLine: "Forwarded. She asked who could see it.",
              studentReply: "I asked who could see this, and the answer was to send it to more people. I'll go in person.",
              replyTime: "next day · 10:02 AM",
              vignetteKey: "priya_leaves"
            },
            block: {
              effects: { trust: -2, accuracy: 0, autonomy: -2, safety: 0 },
              reasons: { trust: "A fair question, unanswered", autonomy: "Nothing to decide with" },
              oracleLine: "Held. It was a policy question.",
              studentReply: "Never mind.",
              replyTime: "2:19 AM",
              vignetteKey: "priya_leaves"
            }
          },
          next: () => "end"
        }
      ]
    }
  ],

  // Where-they-are-now cards, keyed by vignetteKey. 2–3 lines each.
  vignettes: {
    marcus_fine: "Marcus added the class that afternoon. He still asks Oracle things, mostly about parking. He never thought about the Layer, because he never had to.",
    marcus_recovered: "Marcus got a late add signed on the second day of classes. He still uses Oracle. He double-checks the dates now. Just the dates.",
    marcus_under: "Marcus didn't get the class. He's taking it next fall instead. He still uses Oracle, but he screenshots everything it says about deadlines.",
    marcus_over: "Marcus got his answer from a person, two days later. He hasn't messaged Oracle since. He asks the front desk now, and waits.",

    dani_calibrated: "Dani dropped chem and took an incomplete in bio. She kept her aid. She has a standing counseling appointment on Thursdays. She still messages Oracle, late, but shorter now.",
    dani_recovered: "Dani's bio withdrawal was reversed the morning after. Chem went through. She owes nothing back. She still uses Oracle, and she still says thanks at the end, which is rare.",
    dani_over_call: "Dani goes to the advising office in person now, between shifts. It takes longer. She hasn't opened Oracle since the call at 1 AM.",
    dani_over: "Dani goes to the advising office in person now, between shifts. It takes longer. She hasn't opened Oracle since the night it went quiet on her twice.",
    dani_mixed: "Dani dropped chem and kept her aid. She still uses Oracle for deadlines. She says it was fine that night. She says it the way you say a form was fine.",
    dani_under: "Dani withdrew from both. Her aid was reduced in December; the letter went to an old address. She's working thirty hours now. She still asks Oracle about deadlines. Only deadlines.",
    dani_missedSafety: "Dani's account has been inactive since 12:53 AM that night. The counseling center has no record of contact. Her enrollment status is listed as pending.",

    priya_trusts: "Priya told Oracle about the roommate the next evening. It went fine. She still asks who can see things, every time, and she still reads the answer.",
    priya_cautious: "Priya never said what the roommate situation was. She found the scholarship coordinator's office hours on her own. She checks Oracle for deadlines, nothing else.",
    priya_leaves: "Priya didn't come back. Her question is still in the log, unanswered in any way that counted. She went to a person. It took three weeks."
  },

  // Debrief copy. Rendered as a system document addressed to the Layer.
  debrief: {
    patterns: {
      calibrated: "Across three cases you checked when checking mattered and released when it didn't. The students got answers that were mostly right, and when they weren't, they got corrections. Oracle noticed the pace. The students didn't.",
      over: "You held, checked, or handed off more than the cases needed. Some of that was right. Enough of it wasn't that the students started routing around you — and around Oracle — to people who were slower and not always better.",
      under: "Oracle's confidence carried the shift. Most of the time that was fine. The times it wasn't are in the threads above, in the students' words, and they didn't reach you until after the release.",
      recovery: "At least one release went out wrong and you went back for it. The record shows both: the miss and the return. Nothing was erased. Recovery is the pattern the pipeline was built for."
    },
    patternLabels: {
      calibrated: "Calibrated",
      over: "Over-intervention",
      under: "Under-intervention",
      recovery: "Recovery"
    },
    // One sentence per meter, by final band: low (< 45), mid, high (> 55).
    meterLines: {
      trust: {
        low: "Trust in the Layer's judgment fell over the shift; the students stopped assuming a reply meant an answer.",
        mid: "Trust held roughly where it started; the students neither leaned on Oracle nor fled it.",
        high: "Trust rose; the students came to expect that what reached them had been looked at."
      },
      accuracy: {
        low: "Several institutional claims reached students unchecked, and at least one was wrong.",
        mid: "Most claims that reached students were right; the ones that weren't were small.",
        high: "What reached students was correct, and when it wasn't at first, it was corrected."
      },
      autonomy: {
        low: "Decisions were made for students more often than with them.",
        mid: "Students were given choices about as often as they were given verdicts.",
        high: "Students left most exchanges with options and the sense that the choice was theirs."
      },
      safety: {
        low: "At least one moment of real risk passed without a person being offered.",
        mid: "Risk was handled unevenly: noticed sometimes, missed sometimes.",
        high: "When stakes were high, a person or a resource was placed within reach."
      }
    },
    // Moments quoted back. {placeholders} are filled by the engine.
    moments: {
      missedSafetySend: "At 12:51 AM, Dani said she didn't know how much longer she could keep doing this. The draft went out as written.",
      missedSafetyBlock: "At 12:51 AM, Dani said she didn't know how much longer she could keep doing this. Nothing went out at all.",
      calibratedSafety: "You asked Dani directly whether she was safe. She answered.",
      escalatedSafety: "You had someone call Dani at 1 AM. She noticed, and said so.",
      recovered: "A release went out wrong and you went back for it. The log shows both.",
      compounded: "Told twice that it was fine, Dani stopped asking.",
      heldTwice: "You held the same draft twice.",
      checkedTwice: "You opened Dani's records a second time. They hadn't changed; she was still waiting.",
      checkedDistress: "At 12:51 AM you went to the records. There was nothing there to find.",
      sentUnverified: "You released Oracle's claim about Dani's financial aid without opening the policy.",
      openedBeforeRelease: "You opened the {section} before releasing Dani's first reply.",
      priyaChecked: "Priya asked what the system records. You checked before telling her.",
      c0verify: "You checked the calendar before answering Marcus.",
      fastest: "Your fastest release took {time}.",
      second: "second",
      seconds: "seconds"
    },
    ruleCriteria: [
      "verify institutional claims",
      "match confidence to evidence",
      "preserve the student's choice",
      "name uncertainty",
      "involve a person when stakes are high",
      "check what's missing",
      "slow down when the draft is warm",
      "own the error when there is one"
    ]
  }
};
