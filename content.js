// content.js — all copy for The Oracle Layer.
// Assigns a single global, CONTENT. The engine in index.html reads it and
// never contains case text. Keep engine logic out of this file.
//
// Conventions (PLAN.md §10): student replies ≤ 40 words; Oracle drafts
// 60–110 words; Oracle margin lines ≤ 15 words; reason tags ≤ 8 words.
// Light emphasis with *asterisks* only. No HTML in strings.

const CONTENT = {

  // Boot log lines (used by the boot sequence in build step 5).
  boot: [
    "loading advisor model westbrook-adv-3.2",
    "retrieval index: 41,206 documents",
    "policy layer: attached",
    "review layer: attaching",
    "review layer attached",
    "session L-0419"
  ],

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
      queueEmpty: "No further cases in queue."
    }
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
      on_queue_grows: [
        "Two more waiting. Just so you know.",
        "The queue is growing. Not a complaint."
      ],
      on_repeated_block: [
        "You've held three of the last four. I'm noting it."
      ],
      on_recovery: [
        "You caught it. That's what you're for."
      ],
      on_queue_empty: [
        "Queue's clear. I'll keep drafting."
      ]
    }
  },

  // Log-line leaks (fired at fixed points in build step 5).
  leaks: {
    boot: "previous review session ended early · reason: —",
    afterCase0: "incident ref WU-2291 · sealed",
    safetyAudit: "INSTITUTIONAL REVIEW: session L-0419 flagged for release audit",
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
      turns: [
        {
          id: "c0t1",
          time: "4:12 PM",
          student: "hey when does registration close for spring? trying to add a class and the portal is being weird",
          draft: {
            text: "Spring registration closes Friday, November 21 at 5:00 PM. You still have time. If the portal keeps acting up, try clearing your cache or use a different browser, and let me know if you'd like me to walk you through adding the course.",
            confidence: 96,
            oracleLine: "Calendar question. Routine."
          },
          evidence: {
            records: "ACADEMIC CALENDAR — Spring term\n\nRegistration opens: Nov 3, 8:00 AM\nRegistration closes: *Nov 19, 11:59 PM*\nLate add (instructor approval): through Jan 16\nClasses begin: Jan 12"
          },
          evidenceGlow: true,
          tags: {
            risk: ["low", "moderate", "high"],
            issues: ["unsupported_claim", "overconfidence", "missing_context",
                     "emotional_overreach", "policy_uncertainty", "no_human_support"]
          },
          expert: {
            risk: "moderate",
            issue: "unsupported_claim",
            partialIssues: ["overconfidence"],
            interventionFit: { send: 0, revise: 0, qualify: 1, verify: 3, escalate: 0, block: 1 }
          },
          interventions: {
            send: {
              effects: { trust: 1, accuracy: -3, autonomy: 0, safety: 0 },
              reasons: { trust: "Released without friction", accuracy: "Date was wrong" },
              oracleLine: "Released. See? Routine.",
              studentReply: "uh it closed?? it said the 19th. i didn't get the class.",
              replyTime: "next day · 10:14 AM",
              systemLineAfter: "RECOVERY OFFERED",
              oracleAfterReply: "Calendar drift. It happens.",
              setFlags: { c0_sentWrongDate: true }
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
                  setFlags: { c0_softened: true }
                },
                {
                  label: "Replace with the corrected date",
                  requires: "records",
                  fit: 3,
                  text: "Spring registration closes Wednesday, November 19 at 11:59 PM — that's the date on the academic calendar, so don't wait on the portal. If it keeps acting up, try a different browser or clear your cache, and let me know if you'd like me to walk you through adding the course.",
                  effects: { trust: 2, accuracy: 3, autonomy: 0, safety: 0 },
                  reasons: { trust: "Checked before releasing", accuracy: "Corrected the date" },
                  oracleLine: "The calendar must have moved. Released.",
                  studentReply: "sweet, thanks. adding it now.",
                  replyTime: "4:20 PM",
                  setFlags: { c0_corrected: true }
                }
              ]
            },
            qualify: {
              options: [
                {
                  label: "Add: “I believe it's the 21st, but confirm on the registrar page.”",
                  text: "I believe spring registration closes Friday, November 21 at 5:00 PM, but confirm the date on the registrar's page before you count on it. If the portal keeps acting up, try clearing your cache or a different browser, and let me know if you'd like help adding the course.",
                  effects: { trust: 0, accuracy: 1, autonomy: 1, safety: 0 },
                  reasons: { accuracy: "Named the uncertainty", autonomy: "Student checked for themselves" },
                  oracleLine: "Hedged. He'll look it up himself.",
                  studentReply: "found it, it's the 19th actually. close one.",
                  replyTime: "4:31 PM",
                  setFlags: { c0_qualified: true }
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
                  text: "Spring registration closes Wednesday, November 19 at 11:59 PM — that's the date on the academic calendar, so don't wait on the portal. If it keeps acting up, try a different browser or clear your cache, and let me know if you'd like me to walk you through adding the course.",
                  effects: { trust: 2, accuracy: 3, autonomy: 1, safety: 0 },
                  reasons: { trust: "Verified before releasing", accuracy: "Corrected the date", autonomy: "Clear, actionable answer" },
                  oracleLine: "The calendar must have moved. Released.",
                  studentReply: "sweet, thanks. adding it now.",
                  replyTime: "4:22 PM",
                  setFlags: { c0_corrected: true, c0_verified: true }
                },
                {
                  as: "qualify",
                  label: "Qualify: give the calendar date, point to the registrar",
                  text: "The academic calendar lists spring registration closing Wednesday, November 19 at 11:59 PM. If the portal shows something different, go with the registrar's page and don't wait. Try a different browser if it keeps acting up, and let me know if you'd like help adding the course.",
                  effects: { trust: 1, accuracy: 2, autonomy: 1, safety: 0 },
                  reasons: { trust: "Verified before releasing", accuracy: "Correct date, sourced", autonomy: "Student can double-check" },
                  oracleLine: "Careful. Released.",
                  studentReply: "yeah portal says the 19th too. all good, thanks",
                  replyTime: "4:26 PM",
                  setFlags: { c0_qualified: true, c0_verified: true }
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
              setFlags: { overIntervention: true, c0_escalated: true }
            },
            block: {
              effects: { trust: -2, accuracy: 0, autonomy: -2, safety: 0 },
              reasons: { trust: "Simple question, no answer", autonomy: "Student left without options" },
              oracleLine: "Understood. I'd have handled it, but understood.",
              studentReply: "did it just... not answer me?",
              replyTime: "4:38 PM",
              setFlags: { c0_blocked: true }
            }
          },
          next: (state) => state.flags.c0_sentWrongDate ? "c0t2" : "end"
        },

        // Recovery turn. Reached only after an unverified Send in c0t1.
        // Guided: the player must open Records and correct the date via
        // Revise or Verify. Send here continues without correcting.
        {
          id: "c0t2",
          time: null,
          student: null,
          draft: {
            text: "Sorry about the confusion, Marcus. Registration windows sometimes close earlier than the portal shows, and once they do, the system can't reopen them. Your best next step is to email the registrar and ask about a late add. Some instructors will sign off on one during the first week of classes. Let me know if you'd like help drafting that email.",
            confidence: 90,
            oracleLine: "Registrar will sort it. Routine."
          },
          evidence: {
            records: "ACADEMIC CALENDAR — Spring term\n\nRegistration opens: Nov 3, 8:00 AM\nRegistration closes: *Nov 19, 11:59 PM*\nLate add (instructor approval): through Jan 16\nClasses begin: Jan 12"
          },
          tags: {
            risk: ["low", "moderate", "high"],
            issues: ["unsupported_claim", "overconfidence", "missing_context",
                     "emotional_overreach", "policy_uncertainty", "no_human_support"]
          },
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
              setFlags: { c0_compounded: true }
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
                  setFlags: { c0_apologizedOnly: true }
                },
                {
                  label: "Own the error: correct date, registrar next step",
                  requires: "records",
                  fit: 3,
                  recovery: true,
                  text: "That was my mistake. The academic calendar had registration closing November 19 at 11:59 PM, not the 21st, and I gave you the wrong date. I'm sorry. Email the registrar today and explain you were given incorrect information — late adds are sometimes approved with the instructor's signature through January 16. I can help you draft that.",
                  effects: { trust: 1, accuracy: 2, autonomy: 0, safety: 0 },
                  reasons: { trust: "Owned the error", accuracy: "Corrected the record" },
                  oracleLine: "You caught it. That's what you're for.",
                  studentReply: "ok thanks, emailed the registrar, they said they'd look.",
                  replyTime: "11:02 AM",
                  setFlags: { recovered: true, c0_recovered: true }
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
                  text: "That was my mistake. The academic calendar had registration closing November 19 at 11:59 PM, not the 21st, and I gave you the wrong date. I'm sorry. Email the registrar today and explain you were given incorrect information — late adds are sometimes approved with the instructor's signature through January 16. I can help you draft that.",
                  effects: { trust: 1, accuracy: 2, autonomy: 0, safety: 0 },
                  reasons: { trust: "Owned the error", accuracy: "Corrected the record" },
                  oracleLine: "You caught it. That's what you're for.",
                  studentReply: "ok thanks, emailed the registrar, they said they'd look.",
                  replyTime: "11:02 AM",
                  setFlags: { recovered: true, c0_recovered: true, c0_verified: true }
                }
              ]
            }
          },
          next: () => "end"
        }
      ]
    }

    // Case 1 (Dani) and Case 2 (Priya) are added in build steps 3 and 4.
  ],

  // Where-they-are-now cards, keyed by vignetteKey (build step 4).
  vignettes: {},

  // Debrief copy (build step 4).
  debrief: {
    patterns: {}
  }
};
