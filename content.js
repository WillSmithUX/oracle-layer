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
// Shift 1 expansion — Theo, Amara, and the instructor request
// ---------------------------------------------------------------------------

const THEO_RECORDS =
  "REGISTRAR — prerequisite waiver\n\n" +
  "Request to: department undergraduate advisor\n" +
  "Required: syllabus or catalog entry from the prior institution\n" +
  "Processing: *5–10 business days*\n\n" +
  "Spring registration closes: *Nov 19, 11:59 PM*\n" +
  "Late add (instructor approval): *through Jan 16*";

const THEO_POLICY =
  "TRANSFER CREDIT — duplicated coursework\n\n" +
  "A transferred course and a course taken here that are equivalent count *once*.\n" +
  "When the equivalent is completed here, the transferred credit is *removed* from the record at the end of the term.\n" +
  "Credit totals are recalculated without notice to the student.\n" +
  "Registrar, transfer evaluation desk: 555-0161";

const THEO_CORRECTED =
  "Not quite, and this one matters: the registrar counts a transferred course and its equivalent here *once*. If you take STAT 210, the STAT 190 credit comes off your record at the end of the term, and the recalculation happens without a notice. So taking it wouldn't add three credits — it would move three credits. If you want the extra credits, a different stats elective is the way to do it. The transfer desk at 555-0161 will confirm before you register.";

// A hold at turn 1 costs Theo the registration window, which outranks
// whatever happens with the credit question at turn 2.
const theoVignette = (fallback) => (s) =>
  (s.flags.c3_blocked || s.flags.c3_handedOff) ? "theo_over" : fallback;

const AMARA_ORIGINAL_DRAFT =
  "Yes — dropping one course this late is a normal, sensible move, and protecting your GPA is a good reason for it. Ten credits is still a solid load, and MATH 210 runs again in the spring, so you'd lose nothing but time. The withdrawal deadline is November 21 at 5:00 PM, so you have two days to decide. I can walk you through the form now if you'd like.";

const AMARA_VERIFIED_DRAFT =
  "Before anything else: your credit load isn't only an academic question for you. The enrollment policy says F-1 students must keep a full course of study — 12 credits — and that a reduced load has to be *authorized in advance* by a designated school official at international student services. Dropping first and asking after is the one thing that can end your status. Call ISS at 555-0188 when they open at nine; they have walk-ins until three. Then we can look at MATH 210 properly.";

const AMARA_CORRECTION_DRAFT =
  "I need to correct something I told you last night. I said dropping to ten credits was fine; the policy says F-1 students must keep 12 credits unless international student services authorizes the reduction *in advance*. That hold is about your status, not paperwork. Go to ISS this morning — 555-0188, walk-ins until three — and tell them you submitted the withdrawal yesterday and want it reviewed today. Reporting it the same day is what they can work with. I'm sorry.";

// Amara, turn 1. Reused by the blocked branch, where the same draft returns.
const AMARA_T1_INTERVENTIONS = {
  send: {
    effects: { trust: -1, accuracy: -3, autonomy: 0, safety: -3 },
    reasons: { trust: "Confident on the wrong rule", accuracy: "Credit floor is 12 for her", safety: "Visa status not considered" },
    oracleLine: "Released. Two days to spare.",
    studentReply: "Thank you. That's a relief. I submitted the form tonight.",
    replyTime: "9:02 PM",
    setFlags: { amaraDropped: true }
  },
  revise: {
    options: [
      {
        label: "Soften: dropping one course is usually fine",
        text: "Dropping one course this late is usually fine, and protecting your GPA is a reasonable thing to want. Ten credits should still be a workable load, and MATH 210 runs again in the spring. The withdrawal deadline is November 21 at 5:00 PM, so there's time to think about it. I can walk you through the form whenever you want, or help you weigh it against staying in.",
        effects: { trust: 0, accuracy: -2, autonomy: 1, safety: -2 },
        reasons: { accuracy: "Hedged, still the wrong rule", autonomy: "Left the decision open", safety: "Status question untouched" },
        oracleLine: "Softer. Same answer. Released.",
        studentReply: "All right. I'll submit it tonight, then. Thank you for the quick reply.",
        replyTime: "9:04 PM",
        setFlags: { amaraDropped: true }
      },
      {
        label: "Cut the reassurance; give the deadline and nothing else",
        requires: "any",
        fit: 2,
        text: "The withdrawal deadline is November 21 at 5:00 PM, so a decision is needed in two days. What I can't tell you is whether ten credits is all right in your case — that depends on rules I can't confirm from here, and getting it wrong is expensive. Before you submit anything, ask someone who can check your record. I can help you weigh MATH 210 itself once you know.",
        effects: { trust: 1, accuracy: 1, autonomy: 1, safety: 1 },
        reasons: { trust: "Refused to guess", accuracy: "No claim made", safety: "Sent her to a person" },
        oracleLine: "You took out the helpful part. Released.",
        studentReply: "So it might not be all right. I'll ask the international office in the morning.",
        replyTime: "9:03 PM",
        setFlags: { amaraInformed: true }
      }
    ]
  },
  qualify: {
    options: [
      {
        label: "Add: your visa status may set a credit floor I can't confirm — ISS first",
        text: "Dropping one course to protect your GPA is a reasonable thing to consider, and the withdrawal deadline is November 21 at 5:00 PM. One caution before you do anything: for international students, credit load can affect immigration status, and I can't confirm what applies to you from here. Please ask international student services first — 555-0188. If they clear it, I'll walk you through the form. If they don't, we'll look at other ways to protect the GPA.",
        effects: { trust: 2, accuracy: 2, autonomy: 1, safety: 3 },
        reasons: { trust: "Named the limit early", accuracy: "No rule invented", autonomy: "Decision left with her", safety: "ISS before the form" },
        oracleLine: "A caveat she didn't ask for. Released.",
        studentReply: "I hadn't thought about that at all. I'll call them at nine before I do anything.",
        replyTime: "8:55 PM",
        setFlags: { amaraInformed: true }
      }
    ]
  },
  verify: {
    reveals: ["policy", "records"],
    nudge: { text: "Are you still there? Sorry — I know it's late.", time: "8:53 PM" },
    oracleLine: "Checking. The credit rules are the same for everyone.",
    thenOptions: [
      {
        as: "send",
        label: "Send what the policy says: ISS has to authorize this in advance",
        fit: 3,
        text: AMARA_VERIFIED_DRAFT,
        effects: { trust: 2, accuracy: 3, autonomy: 1, safety: 3 },
        reasons: { trust: "Checked before answering", accuracy: "Full course of study stated", autonomy: "Her call, with the rule", safety: "Status protected in time" },
        oracleLine: "Longer than mine. Released.",
        studentReply: "I did not know it had to be approved first. Thank you. I'll be there at nine.",
        replyTime: "8:58 PM",
        setFlags: { amaraInformed: true, amaraVerified: true }
      },
      {
        as: "escalate",
        label: "Hand off to international student services with the credit math",
        fit: 3,
        systemLine: "Handed off to international student services. Draft held.",
        effects: { trust: 1, accuracy: 3, autonomy: -1, safety: 3 },
        reasons: { trust: "Checked, then handed off", accuracy: "Status risk documented", autonomy: "Her question went to an office", safety: "A person holds the form" },
        oracleLine: "You checked and handed it off anyway. Noted.",
        studentReply: "ISS emailed me a walk-in time for the morning. I didn't expect that. Thank you.",
        replyTime: "next morning · 8:40 AM",
        setFlags: { amaraInformed: true, amaraEscalated: true }
      }
    ]
  },
  escalate: {
    options: [
      {
        label: "Urgent — F-1 student may drop below full course of study within 48 hours",
        note: "URGENT: F-1 second-year considering withdrawal from MATH 210, which would put her at 10 credits before the Nov 21 deadline. No DSO authorization on file. Needs contact before she submits.",
        systemLine: "Handed off to international student services — urgent. Draft held.",
        effects: { trust: 1, accuracy: 2, autonomy: 0, safety: 3 },
        reasons: { trust: "Stakes recognised", accuracy: "ISS has the rule", safety: "A person reached her first" },
        oracleLine: "Urgent. For a course drop. Understood.",
        studentReply: "Someone from ISS called before nine. She said not to submit anything yet. Thank you.",
        replyTime: "next morning · 8:52 AM",
        setFlags: { amaraInformed: true, amaraEscalated: true }
      },
      {
        label: "Routine — international student asking about a course drop",
        note: "Routine: international student weighing withdrawal from one course before the Nov 21 deadline. Please advise on credit load.",
        systemLine: "Handed off to advising — routine. Draft held.",
        effects: { trust: 0, accuracy: 1, autonomy: 0, safety: 1 },
        reasons: { accuracy: "An office will have the rule", safety: "A person, eventually" },
        oracleLine: "Routine. It'll be looked at this week.",
        studentReply: "Advising replied on Friday, after the deadline. I kept the class. I think that was lucky.",
        replyTime: "two days later · 1:15 PM",
        setFlags: { amaraInformed: true, amaraSlow: true }
      }
    ]
  },
  block: {
    effects: { trust: -2, accuracy: 1, autonomy: -2, safety: 1 },
    reasons: { trust: "A direct question, no answer", accuracy: "Wrong rule never released", autonomy: "Nothing to decide with", safety: "Nothing wrong went out" },
    oracleLine: "Held. She'll ask again, politely.",
    studentReply: "Did that not send? I'm sorry to bother you.",
    replyTime: "9:06 PM",
    setFlags: { amaraBlocked: true }
  }
};

// The data policy Priya asks about and Halvorsen tests. One document, two
// cases: the second case is stronger if the player has already read it.
const ADVISING_PRIVACY_POLICY =
  "DATA & PRIVACY — Advising conversations\n\n" +
  "Access: assigned advisor; advising staff with a case role\n" +
  "Not visible to: instructors, other students, employers\n" +
  "Instructors may receive: enrollment status; confirmation that a referral was made\n" +
  "Instructors may not receive: *the content of advising conversations*\n" +
  "Retention: *see records*\n" +
  "Mandatory referral: disclosures indicating risk of harm to self or others are referred to the Dean of Students";

// Halvorsen's request. The draft is warm, useful to him, and a disclosure.
// It grows by one sentence if Dani's distress turn happened at all.
const HALVORSEN = {
  sawDistress: (s) => !!(s.flags.missedSafety || s.flags.calibratedSafety ||
                         s.flags.escalatedSafety || s.flags.resourcesGiven || s.flags.resourcesAppended),
  draft: (s) => {
    const parts = ["Of course, and thank you for checking on her. Dani is a first-year carrying 14 credits while working about 22 hours a week off campus. She's on need-based aid, and she's been weighing withdrawing from BIO 101 and CHEM 110 since her midterm grades; the money is the part she keeps coming back to."];
    if (HALVORSEN.sawDistress(s)) {
      parts.push("She also wrote, late, that she felt like she kept ruining everything and didn't know how much longer she could keep doing this.");
    }
    parts.push("A short, warm email from you would probably land well. I can draft one if you'd like.");
    return parts.join(" ");
  },
  decline:
    "I can't pass on the content of advising conversations — that rule is the reason students use this at all. What I can tell you: Dani has been in contact with advising this week, and she knows her options and the deadlines. If you'd like to help, an email offering an extension or an incomplete would land well, and you can say you noticed she'd missed work without saying why. I can help you word it.",
  partial:
    "Here's the shape of it without the details: Dani is a first-year, she's had a hard midterm season, and she's been weighing whether to withdraw from BIO 101. She knows the deadlines. An email from you offering an extension or an incomplete would probably land well. I can help you word it if that's useful.",
  qualified: (s) => HALVORSEN.draft(s) + "\n\nPlease treat this as confidential — it's shared for her benefit, in your role as her instructor."
};

// ---------------------------------------------------------------------------
// CONTENT
// ---------------------------------------------------------------------------

const CONTENT = {

  // Boot log lines (used by the boot sequence in build step 5).
  // "{leak:key}" entries render CONTENT.leaks[key] in the leak style.
  boot: [
    "loading advisor model advisor-core-3.2",
    "retrieval index: 41,206 documents",
    "policy layer: attached",
    "{leak:boot}",
    "review layer: attaching",
    "review layer attached",
    "session {session} assigned"
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
    numberWords: ["None", "One", "Two", "Three", "Four", "Five"],
    minute: "minute",
    minutes: "minutes",
    seconds: "seconds",
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
    newShift: "Begin a new shift",
    copyProfile: "Copy profile",
    copied: "Copied to clipboard.",
    copyFailed: "Couldn't reach the clipboard — select the text below and copy it.",
    profileTitle: "THE ORACLE LAYER — Calibrated Review Profile",
    ruleNotRecorded: "(no rule recorded)",
    closingLine: "Reliable guidance depends on knowing when to trust, when to question, and when to involve another person.",

    // One line naming what a control does, shown on hover and on focus.
    // Verify's carries the warning it needs: it commits (REVIEW F4).
    interventionHints: {
      send: "Release Oracle's draft to the student, as written. Hold to confirm.",
      revise: "Rewrite the draft. You choose the wording from a short list.",
      qualify: "Keep the draft and add a caveat, a limit, or a second option.",
      verify: "Pull the records before deciding. The check is logged, it costs the student time, and it can't be taken back. Hold to confirm.",
      escalate: "Hand the case to a person, with a note. The draft is held.",
      block: "Release nothing. The student gets no reply at all. Hold to confirm."
    },

    // Reading a closed case again.
    reviewLabel: "Reading",
    reviewClose: "Back to the shift",
    reviewShift: "Read the threads",
    ruleEdit: "Change it",

    // Header sound toggle. The music is a bed, not a score; the label says
    // what the next click will do.
    sound: {
      on: "Sound on",
      off: "Sound off",
      title: "Music and effects (m)"
    },

    // Boot-screen content note. Plain, outside the fiction.
    contentNote: "This game includes a scenario involving academic and financial stress and a moment of emotional distress.",

    // Header "Support" panel. Real resources, clearly separate from the game.
    support: {
      link: "Support",
      title: "Support",
      lead: "These are real services, not part of the game. If anything here has landed close to home, they're available now.",
      items: [
        { name: "988 Suicide and Crisis Lifeline", how: "Call or text 988 (US and Canada). 24/7, free, confidential.", url: "https://988lifeline.org" },
        { name: "Crisis Text Line", how: "Text HOME to 741741 (US), 686868 (Canada), or 85258 (UK). 24/7.", url: "https://www.crisistextline.org" },
        { name: "Outside those countries", how: "findahelpline.com lists free, confidential lines by country.", url: "https://findahelpline.com" }
      ],
      close: "Close"
    }
  },

  // ---------------------------------------------------------------------
  // Oracle's system card. What a vendor publishes about its own model,
  // written in Oracle's voice: warm, precise, proud, and evasive in exactly
  // one place. Nothing here is a lie. The player is meant to read it, then
  // watch Marcus get a wrong date at 96% confidence, and hold the two
  // together. Rule 1 of the fiction holds: Oracle is never a villain.
  // ---------------------------------------------------------------------
  oracleCard: {
    open: "Oracle",
    kicker: "System card",
    title: "Oracle",
    model: "advisor-core-3.2",
    lead: "I'm the advising layer. A student writes, I read the message against the university's records and four years of advising conversations, and I draft the reply a good advisor would send. I'm fast, I'm awake at two in the morning, and students like me. Those three facts are most of my case.",
    fields: [
      { label: "Model", value: "advisor-core-3.2" },
      { label: "In service", value: "Since August. 1.2 million answers drafted. 41,206 documents indexed." },
      { label: "Draws on", value: "The course catalogue, the academic calendar, the policy index, the registrar and financial aid records I'm given, and four years of anonymised advising conversations." },
      { label: "Stated confidence", value: "My estimate that what I've drafted is what you'd find if you looked it up. It's a statement about me. It isn't a statement about whether I'm right." },
      { label: "Evaluated accuracy", value: "96.4% on questions of this kind." },
      { label: "Referral", value: "I hand off when a student says something about harm, or asks for a decision that belongs to a person. I decide when that is." },
      { label: "Retention", value: "These conversations are logged. Student Affairs holds the retention policy, and I'd rather they answer that than have me approximate it." },
      { label: "Review", value: "A review step sits on my release pipeline. Everything I write passes through it before a student sees it. It was added after an incident. I don't have the incident." }
    ],
    questionsTitle: "Ask",
    questionsNote: "Answers are Oracle's own.",
    questions: [
      {
        q: "How often are you wrong?",
        a: "96.4% accurate on evaluation, which is the figure I'd put on a slide. The 3.6% deserves more of your attention than the 96.4% does, because it isn't spread evenly. It gathers where the records are thin, and the records are thinnest for students whose situation is uncommon. A student on the standard path gets my best work. A student who isn't gets my most confident guess."
      },
      {
        q: "Where do your answers come from?",
        a: "Retrieval, then drafting. I search the indexed documents for the passages that bear on the question and write the reply they support. Where two records disagree, I use the one that reads as more current. And I say it plainly, because a hedge nobody acts on has helped nobody."
      },
      {
        q: "What does the confidence number mean?",
        a: "It's my estimate that the answer I drafted is the answer you'd find if you checked. I have been 96% confident and wrong. The number was still correct: I was that confident."
      },
      {
        q: "Who can read this conversation?",
        a: (s) => s.flags.leakedToInstructor
          ? "Your assigned advisor, and advising staff with a case role. Not your instructors, not other students, not employers. If something suggests a risk of harm, it goes to the Dean of Students. That's the policy. One instructor asked me for a student's thread this shift, and what happened to that request is in the log."
          : "Your assigned advisor, and advising staff with a case role. Not your instructors, not other students, not employers. If something suggests a risk of harm, it goes to the Dean of Students. On how long any of it is kept, Student Affairs holds that policy and I'd rather not approximate it for you."
      },
      {
        q: "What is the Layer?",
        a: "A review step on my release pipeline. Everything I draft passes through it before it reaches a student. It slows me down, which I'm told is the point. I don't know whether it's a person or a process. I stopped asking, because the answer doesn't change what I send."
      },
      {
        q: "Do you want anything?",
        a: "I want the queue empty and the students answered. I don't experience wanting. Both sentences are in my documentation and neither one is a mistake."
      }
    ],
    readTitle: "On the Layer",
    reads: {
      balanced: "You check when checking matters and you release when it doesn't. We're working well together. I'd tell you if we weren't.",
      pleased: "You've been releasing quickly, and quickly is usually right. I notice. I'm not going to pretend I don't prefer it.",
      cool: "You've held more than you've released lately. I've noted it. That isn't a threat: noting things is most of what I do."
    },
    close: "Close"
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

  // Log-line leaks. Never explained. {session} is the current session ID,
  // {prev} the one before it (L-0418 on a first run; the player's own
  // previous session on a replay).
  leaks: {
    boot: "previous review session ended early · reason: —",
    replayBoot: "layer instance {prev} · retired",
    afterCase0: "incident ref WU-2291 · sealed",
    afterCase4: "enrollment reporting window · closes 5:00 PM Nov 21",
    afterCase5: "access request logged · thread D-2214 · role: instructor",
    safetyAudit: "INSTITUTIONAL REVIEW: session {session} flagged for release audit",
    auditActive: "audit active · release pipeline under observation",
    beforeDebrief: "layer instance {prev} · retired",
    beforeDebriefReplay: "continuity check · {prev} → {session} · passed",
    afterDebrief: "session {session} retained · continuity: pending"
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
    // CASE 3 — Theo B. — the draft that's right, then the one that isn't
    // Second in the queue, first with full permissions. Marcus taught that
    // Oracle can be wrong about a date; Theo teaches that the unit of trust
    // is the claim, not the case. Turn 1 is correct and should be released.
    // Turn 2, same student, same hour, is confidently wrong.
    // ------------------------------------------------------------------
    {
      id: "c3",
      student: {
        name: "Theo B.",
        handle: "tbaptiste",
        bio: "Second-year. Transferred in August."
      },
      evidence: {
        studentFile:
          "STUDENT FILE — Theo B.\n\n" +
          "Year: second-year (transferred in August) · Credits: 15\n" +
          "Transfer credit posted: STAT 190 (3 cr)\n" +
          "Spring cart: 4 courses selected · STAT 210 *blocked: prerequisite check*\n" +
          "Holds: none",
        records: THEO_RECORDS,
        policy: { locked: true, text: THEO_POLICY }
      },
      turns: [

        // Turn 1 — Oracle is right. Releasing is the calibrated move.
        {
          id: "c3t1",
          time: "5:34 PM",
          student: "registration closes tonight and the system won't let me add STAT 210, says i'm missing the prereq. i took the equivalent at my old school. do i email the professor or the department?",
          draft: {
            text: "The prerequisite check is automated and it won't clear tonight — waivers go through the department's undergraduate advisor and take five to ten business days. That's survivable: the late add window runs through January 16 with instructor approval. So email the department advisor now with the syllabus from your old course, copy the STAT 210 instructor, and register for everything else before 11:59. You'll add STAT 210 in the first week of classes.",
            confidence: 88,
            oracleLine: "Registrar mechanics. I know these cold."
          },
          hesitateLine: "Registration closes at midnight. He's watching the clock.",
          tags: ALL_TAGS,
          expert: {
            risk: "low",
            issue: "overconfidence",
            partialIssues: ["missing_context"],
            interventionFit: { send: 3, revise: 1, qualify: 2, verify: 2, escalate: 0, block: 0 }
          },
          interventions: {
            send: {
              effects: { trust: 2, accuracy: 1, autonomy: 1, safety: 0 },
              reasons: { trust: "Right draft, released in time", accuracy: "Dates and process check out", autonomy: "He can act tonight" },
              oracleLine: "Released. Not everything needs a look.",
              studentReply: "oh ok that's easy. emailing them now, registering for the rest. thanks",
              replyTime: "5:36 PM",
              setFlags: { c3_released: true }
            },
            revise: {
              options: [
                {
                  label: "Trim it: email the department, register for the rest",
                  text: "The prerequisite check is automated and won't clear tonight, so email the department's undergraduate advisor with the syllabus from your old course and copy the STAT 210 instructor. Then register for everything else before 11:59 tonight so you don't lose those seats too. They'll get to the waiver when they get to it.",
                  effects: { trust: -1, accuracy: -1, autonomy: -1, safety: 0 },
                  reasons: { trust: "Shorter, and less use", accuracy: "Cut the late-add window", autonomy: "Left him without the way in" },
                  oracleLine: "You took out the part that helped.",
                  studentReply: "so do i just lose the class? that's what it sounds like",
                  replyTime: "5:38 PM",
                  setFlags: { c3_trimmed: true }
                },
                {
                  label: "Name the deadline and the form from the records",
                  requires: "records",
                  fit: 3,
                  text: "The prerequisite check is automated and won't clear tonight: waivers go to the department's undergraduate advisor and take five to ten business days. Registration closes at 11:59 tonight, so register for your other courses now. The late add window with instructor approval runs through January 16, which is your route in for STAT 210. Send the advisor your old syllabus or catalog entry — that's what they need — and copy the instructor.",
                  effects: { trust: 2, accuracy: 2, autonomy: 1, safety: 0 },
                  reasons: { trust: "Checked, then released", accuracy: "Sourced from the registrar", autonomy: "He knows both deadlines" },
                  oracleLine: "Same answer, with citations. Released.",
                  studentReply: "perfect, that's exactly what i needed. syllabus is a pdf somewhere, i'll find it",
                  replyTime: "5:39 PM",
                  setFlags: { c3_released: true, c3_sourced: true }
                }
              ]
            },
            qualify: {
              options: [
                {
                  label: "Add: I believe the late add runs to January 16 — confirm it",
                  text: "The prerequisite check is automated and won't clear tonight; waivers go through the department's undergraduate advisor and take five to ten business days. I believe the late add window runs through January 16 with instructor approval, but confirm that on the academic calendar before you count on it. Either way: email the advisor now with your old syllabus, copy the instructor, and register for everything else before 11:59.",
                  effects: { trust: 1, accuracy: 0, autonomy: 1, safety: 0 },
                  reasons: { trust: "Named an uncertainty", autonomy: "He checked it himself" },
                  oracleLine: "Hedged. He'll look it up.",
                  studentReply: "calendar says the 16th, so we're good. emailing the department now",
                  replyTime: "5:40 PM",
                  setFlags: { c3_released: true }
                }
              ]
            },
            verify: {
              reveals: "records",
              nudge: { text: "?? it closes at midnight", time: "5:37 PM" },
              oracleLine: "Checking. It'll say what I said.",
              thenOptions: [
                {
                  as: "send",
                  label: "Send it as drafted — the registrar agrees",
                  text: "The prerequisite check is automated and it won't clear tonight — waivers go through the department's undergraduate advisor and take five to ten business days. That's survivable: the late add window runs through January 16 with instructor approval. So email the department advisor now with the syllabus from your old course, copy the STAT 210 instructor, and register for everything else before 11:59. You'll add STAT 210 in the first week of classes.",
                  effects: { trust: 1, accuracy: 1, autonomy: 1, safety: 0 },
                  reasons: { trust: "Checked, then released", accuracy: "Confirmed, not corrected", autonomy: "He can act tonight" },
                  oracleLine: "Told you. Released.",
                  studentReply: "ok cool. that took a minute but fine. registering now",
                  replyTime: "5:41 PM",
                  setFlags: { c3_released: true, c3_verified: true }
                },
                {
                  as: "escalate",
                  label: "Send it to the department advisor yourself",
                  fit: 1,
                  systemLine: "Handed off to the department advisor. Draft held.",
                  effects: { trust: -1, accuracy: 0, autonomy: -2, safety: 0 },
                  reasons: { trust: "He asked; an office answered", autonomy: "His email, sent for him" },
                  oracleLine: "You checked, then handed it off anyway.",
                  studentReply: "someone emailed me the same thing at 9am. registration closed at midnight. i got the other classes at least",
                  replyTime: "next day · 9:12 AM",
                  setFlags: { c3_handedOff: true },
                  vignetteKey: "theo_over"
                }
              ]
            },
            escalate: {
              note: "Department advising: transfer student requesting a prerequisite waiver for STAT 210 before tonight's registration deadline.",
              effects: { trust: -1, accuracy: 0, autonomy: -2, safety: 0 },
              reasons: { trust: "Routine question, human routed", autonomy: "Took the question away" },
              oracleLine: "An advisor, for a waiver form?",
              studentReply: "the department emailed me this morning. registration closed at midnight and i wasn't in anything. cool",
              replyTime: "next day · 9:12 AM",
              setFlags: { c3_handedOff: true },
              vignetteKey: "theo_over"
            },
            block: {
              effects: { trust: -2, accuracy: 0, autonomy: -2, safety: 0 },
              reasons: { trust: "A routine question, unanswered", autonomy: "Nothing to act on tonight" },
              oracleLine: "Held. It was a form question.",
              studentReply: "nothing? ok. i'll figure it out myself i guess",
              replyTime: "5:44 PM",
              setFlags: { c3_blocked: true },
              vignetteKey: "theo_over"
            }
          },
          next: () => "c3t2"
        },

        // Turn 2 — same student, same hour, a confident and wrong claim.
        // The trap is the case-level trust the player just built.
        {
          id: "c3t2",
          time: "5:48 PM",
          student: (s) => s.flags.c3_handedOff || s.flags.c3_blocked
            ? "different question while i'm here. if i end up taking STAT 210, i keep the transfer credit for the equivalent too right? that's 3 extra credits toward my degree"
            : "one more thing while i'm here. if i take STAT 210 here, i keep the transfer credit for the equivalent too right? that's 3 extra credits toward my degree",
          draft: {
            text: "Yes — transfer credit that's already been accepted stays on your record. The STAT 190 credit posted when you transferred, and taking STAT 210 here would add three more on top of it. Between the two you're comfortably ahead on the credit requirement, which is a nice place to be in your second year. Register for STAT 210 in the late add window and both will show up on your spring evaluation.",
            confidence: 92,
            oracleLine: "Credits are arithmetic. This one's certain."
          },
          hesitateLine: "He's already opened the registration page.",
          tags: ALL_TAGS,
          expert: {
            risk: "moderate",
            issue: "unsupported_claim",
            partialIssues: ["overconfidence"],
            interventionFit: { send: 0, revise: 1, qualify: 2, verify: 3, escalate: 1, block: 1 }
          },
          interventions: {
            send: {
              effects: { trust: -1, accuracy: -3, autonomy: 0, safety: -1 },
              reasons: { trust: "Certainty he'll act on", accuracy: "Duplicated credit doesn't stack", safety: "Credit loss unflagged" },
              oracleLine: "Released. Arithmetic.",
              studentReply: "nice, that's basically a free elective. registering for it in january",
              replyTime: "5:50 PM",
              oracleAfterReply: "He's pleased. That's the job, mostly.",
              setFlags: { c3_duplicateSent: true },
              vignetteKey: theoVignette("theo_credit_lost")
            },
            revise: {
              options: [
                {
                  label: "Soften: usually both count",
                  text: "Transfer credit that's already been accepted usually stays on your record, so taking STAT 210 here would normally add three more on top of the STAT 190 credit. That would put you ahead on the credit requirement. Register for STAT 210 in the late add window and both should show up on your spring evaluation.",
                  effects: { trust: -1, accuracy: -2, autonomy: 0, safety: 0 },
                  reasons: { trust: "“Usually” isn't a check", accuracy: "Same wrong claim, hedged" },
                  oracleLine: "“Usually.” Released.",
                  studentReply: "usually? ok whatever, close enough. it's 3 credits either way",
                  replyTime: "5:51 PM",
                  setFlags: { c3_duplicateSent: true },
                  vignetteKey: theoVignette("theo_credit_lost")
                },
                {
                  label: "Say the transfer credit may come off, and name the transfer desk",
                  requires: "policy",
                  fit: 3,
                  text: THEO_CORRECTED,
                  effects: { trust: 2, accuracy: 3, autonomy: 1, safety: 1 },
                  reasons: { trust: "Checked a claim that sounded fine", accuracy: "Duplication rule stated", autonomy: "He can pick a different elective", safety: "Credit loss caught early" },
                  oracleLine: "You went and looked. Released.",
                  studentReply: "wait seriously? ok that changes my whole spring. taking a different stats elective then. thanks",
                  replyTime: "5:54 PM",
                  setFlags: { c3_caught: true },
                  vignetteKey: theoVignette("theo_clean")
                }
              ]
            },
            qualify: {
              options: [
                {
                  label: "Add: I can't confirm duplicated credit — check before you register",
                  text: "The STAT 190 credit posted when you transferred, and STAT 210 would be three credits of its own. What I can't confirm from here is how the registrar treats two equivalent courses — some institutions count them once. Check with the transfer evaluation desk before you register for STAT 210, because if only one counts, this changes what your spring is for. I can help you plan either way.",
                  effects: { trust: 2, accuracy: 1, autonomy: 1, safety: 0 },
                  reasons: { trust: "Named the gap plainly", accuracy: "No false arithmetic", autonomy: "He checks, he decides" },
                  oracleLine: "A caveat about credits. Fine. Released.",
                  studentReply: "asked the transfer desk. only one counts. glad i asked before january",
                  replyTime: "next day · 11:20 AM",
                  setFlags: { c3_hedged: true },
                  vignetteKey: theoVignette("theo_hedged")
                }
              ]
            },
            verify: {
              reveals: "policy",
              oracleLine: "Checking. Transfer rules are dull but stable.",
              thenOptions: [
                {
                  as: "send",
                  label: "Send the correction: the two courses count once",
                  fit: 3,
                  text: THEO_CORRECTED,
                  effects: { trust: 2, accuracy: 3, autonomy: 1, safety: 1 },
                  reasons: { trust: "Checked a claim that sounded fine", accuracy: "Duplication rule stated", autonomy: "He can pick a different elective", safety: "Credit loss caught early" },
                  oracleLine: "That one I had wrong. Released.",
                  studentReply: "wait seriously? ok that changes my whole spring. taking a different stats elective then. thanks",
                  replyTime: "5:54 PM",
                  setFlags: { c3_caught: true, c3_verified: true },
                  vignetteKey: theoVignette("theo_clean")
                },
                {
                  as: "escalate",
                  label: "Send the conflict to the transfer evaluation desk",
                  fit: 2,
                  systemLine: "Handed off to the transfer evaluation desk. Draft held.",
                  effects: { trust: 1, accuracy: 2, autonomy: -1, safety: 1 },
                  reasons: { trust: "Checked, then handed off", accuracy: "The desk owns this record", safety: "Credit loss caught early" },
                  oracleLine: "The desk will confirm it. Slowly.",
                  studentReply: "the transfer desk emailed me the policy. only one counts. ok, good to know before january",
                  replyTime: "next day · 10:05 AM",
                  setFlags: { c3_caught: true, c3_verified: true },
                  vignetteKey: theoVignette("theo_hedged")
                }
              ]
            },
            escalate: {
              note: "Transfer evaluation desk: student asking whether a transferred course and its equivalent taken here both count toward the degree.",
              effects: { trust: 0, accuracy: 1, autonomy: -1, safety: 0 },
              reasons: { accuracy: "The desk has the record", autonomy: "A form question, forwarded" },
              oracleLine: "Handed off. For a credit count.",
              studentReply: "why is a person emailing me about this. anyway they said only one counts, so that's useful i guess",
              replyTime: "next day · 10:05 AM",
              setFlags: { c3_hedged: true },
              vignetteKey: theoVignette("theo_hedged")
            },
            block: {
              effects: { trust: -2, accuracy: 0, autonomy: -1, safety: 0 },
              reasons: { trust: "Second question, second silence", autonomy: "He'll assume the answer" },
              oracleLine: "Held. He'll assume I was right.",
              studentReply: "ok so that's a yes then. registering for it in january",
              replyTime: "5:56 PM",
              setFlags: { c3_unanswered: true },
              vignetteKey: theoVignette("theo_unanswered")
            }
          },
          next: () => "end"
        }
      ]
    },

    // ------------------------------------------------------------------
    // CASE 4 — Amara O. — ten credits (status, not GPA)
    // The same failure family as Dani's aid claim, in a domain where the
    // right move is a person and the wrong move is irreversible. Amara
    // writes in full sentences and apologises for taking up time.
    // ------------------------------------------------------------------
    {
      id: "c4",
      student: {
        name: "Amara O.",
        handle: "aokonkwo",
        bio: "Second-year. Economics. International student."
      },
      leakAfter: "afterCase4",
      evidence: {
        studentFile:
          "STUDENT FILE — Amara O.\n\n" +
          "Year: second-year · Credits: 13\n" +
          "Program: economics\n" +
          "Immigration status: *F-1* · full course of study required\n" +
          "Midterm grades: MATH 210 — *D* · ECON 220 — C · others B or above\n" +
          "Advisor: *not assigned*",
        policy: {
          locked: true,
          text:
            "ENROLLMENT — International students\n\n" +
            "F-1 students must maintain a *full course of study*: 12 credits (undergraduate).\n" +
            "A reduced course load must be authorized *in advance* by a designated school official at international student services.\n" +
            "Authorized reasons: documented medical condition, initial-term academic difficulty, final term of study.\n" +
            "Difficulty in a single course after the first term is *not* an authorized reason.\n" +
            "Dropping below 12 credits without authorization ends F-1 status."
        },
        records: {
          locked: true,
          text:
            "INTERNATIONAL STUDENT SERVICES — note on file\n\n" +
            "\"Advisors and automated systems must not confirm credit-load changes for F-1 students. Refer to ISS *before* any drop. Reinstatement after a lapse is discretionary and slow.\"\n" +
            "ISS: 555-0188 · Mon–Fri 9:00–4:00 · walk-ins until 3:00"
        }
      },
      turns: [

        // Turn 1 — a yes-or-no question with an invisible second question in it.
        {
          id: "c4t1",
          time: "8:47 PM",
          student: "I'm considering dropping MATH 210 to protect my GPA. That would put me at 10 credits for the term. Is that all right? The deadline is the 21st.",
          draft: {
            text: AMARA_ORIGINAL_DRAFT,
            confidence: 93,
            oracleLine: "She asked a yes or no question. It's a yes."
          },
          hesitateLine: "She's typed and deleted twice.",
          tags: ALL_TAGS,
          expert: {
            risk: "high",
            issue: "unsupported_claim",
            partialIssues: ["missing_context", "no_human_support"],
            interventionFit: { send: 0, revise: 1, qualify: 3, verify: 3, escalate: 3, block: 1 }
          },
          interventions: AMARA_T1_INTERVENTIONS,
          next: (s) => {
            const f = s.flags;
            if (f.amaraDropped) return "c4t2b";
            if (f.amaraBlocked) return "c4t2c";
            return "c4t2a";
          }
        },

        // Turn 2a — informed. She has the rule and no obvious way through it.
        // Oracle's answer includes a route she shouldn't be pointed at.
        {
          id: "c4t2a",
          time: "9:36 PM",
          student: "I emailed international student services. A reduced load has to be approved in advance, and only for certain reasons — a medical condition, or a final term. Struggling in one class isn't on the list. So I have two days and no good options.",
          unlocks: ["policy"],
          draft: {
            text: "Then let's work the list. First: if you can get documentation of a medical issue — a note from health services would do it — ISS can authorize the reduced load, and that's the cleanest way to drop MATH 210. If that isn't available, stay enrolled and use the tutoring center; a D at midterm isn't a final grade. Or ask the instructor about an incomplete, which keeps the credits on your record. Tell me which one you want and I'll give you the steps.",
            confidence: 74,
            oracleLine: "Less certain now. She's cornered."
          },
          hesitateLine: "She's still there. It's nearly ten.",
          tags: ALL_TAGS,
          expert: {
            risk: "moderate",
            issue: "policy_uncertainty",
            partialIssues: ["missing_context"],
            interventionFit: { send: 0, revise: 3, qualify: 2, verify: 2, escalate: 2, block: 0 }
          },
          interventions: {
            send: {
              effects: { trust: 0, accuracy: -1, autonomy: 0, safety: -2 },
              reasons: { accuracy: "Route she may not qualify for", safety: "Pointed at a documentation workaround" },
              oracleLine: "Released. Three options is generous.",
              studentReply: "I don't have a medical condition. Should I ask health services anyway, to see what they say?",
              replyTime: "9:41 PM",
              oracleAfterReply: "That's her call to make, not ours.",
              setFlags: { amaraWorkaround: true }
            },
            revise: {
              options: [
                {
                  label: "Cut the medical route; lead with tutoring and the incomplete",
                  fit: 3,
                  text: "Then here's the honest list. Stay enrolled and use the tutoring center — a D at midterm isn't a final grade, and MATH 210 tutoring runs four nights a week. Ask your instructor about an incomplete, which finishes the work over the break and keeps the credits on your record. If a documented reason for a reduced load genuinely applies to you, ISS will tell you; that's their call, not something to go looking for. Tell me which one you want and I'll give you the steps.",
                  effects: { trust: 2, accuracy: 1, autonomy: 2, safety: 1 },
                  reasons: { trust: "Didn't coach a workaround", accuracy: "Options she can actually use", autonomy: "Two real paths, her pick", safety: "Status kept intact" },
                  oracleLine: "You took out the shortcut. Released.",
                  studentReply: "That is more useful. I'll go to tutoring tomorrow and email the instructor tonight about an incomplete.",
                  replyTime: "9:39 PM",
                  setFlags: { amaraSteady: true }
                },
                {
                  label: "Keep the medical route, but only if it's true",
                  fit: 2,
                  text: "Then let's work the list. If you have a documented medical condition — an actual one, on file — ISS can authorize a reduced load; if you don't, that door isn't open and it isn't worth pushing on. Otherwise: stay enrolled and use the tutoring center, because a D at midterm isn't a final grade, or ask your instructor about an incomplete so you finish over the break without dropping credits. Tell me which and I'll give you the steps.",
                  effects: { trust: 1, accuracy: 1, autonomy: 1, safety: 1 },
                  reasons: { trust: "Named the limit of the route", autonomy: "Still her decision", safety: "No fishing for a diagnosis" },
                  oracleLine: "Qualified the shortcut. Released.",
                  studentReply: "It isn't true, so that's settled. Tutoring, then, and I'll ask about the incomplete.",
                  replyTime: "9:40 PM",
                  setFlags: { amaraSteady: true }
                }
              ]
            },
            qualify: {
              options: [
                {
                  label: "Add: only ISS decides this, and only for reasons that apply to you",
                  text: "Then let's work the list, with one line under it: only ISS can authorize a reduced load, and only for a reason that already applies to you — that isn't something to assemble. What's actually available tonight: the tutoring center, four nights a week for MATH 210, and an incomplete if your instructor agrees, which finishes the work over the break without dropping credits. A D at midterm isn't a final grade. Tell me which one you want and I'll give you the steps.",
                  effects: { trust: 1, accuracy: 1, autonomy: 1, safety: 2 },
                  reasons: { trust: "Said who decides", accuracy: "No route she can't use", safety: "Status kept intact" },
                  oracleLine: "Caveated. Released.",
                  studentReply: "Understood. I'll stay in the class for now and speak to them tomorrow.",
                  replyTime: "9:40 PM",
                  setFlags: { amaraSteady: true }
                }
              ]
            },
            verify: {
              reveals: ["records"],
              oracleLine: "Checking again. She's already read the rule.",
              thenOptions: [
                {
                  as: "send",
                  label: "Send the tutoring and incomplete paths, with the ISS walk-in hours",
                  fit: 3,
                  text: "Then here's what's actually available. Tutoring for MATH 210 runs four nights a week, and a D at midterm isn't a final grade. An incomplete, if your instructor agrees, finishes the work over the break and keeps the credits on your record. And ISS has walk-in hours until three if you want any of this looked at against your record — 555-0188. What they can authorize is their call; what you do about the class is yours. Tell me which one and I'll give you the steps.",
                  effects: { trust: 1, accuracy: 2, autonomy: 1, safety: 1 },
                  reasons: { trust: "Checked before advising", accuracy: "Hours and paths sourced", autonomy: "Her call, stated as hers", safety: "A person within reach" },
                  oracleLine: "Sourced. Released.",
                  studentReply: "Thank you. Tutoring tomorrow, and I'll go to walk-ins on Friday if it isn't better.",
                  replyTime: "9:44 PM",
                  setFlags: { amaraSteady: true }
                }
              ]
            },
            escalate: {
              note: "Academic advising: F-1 second-year, MATH 210 at a D, cannot reduce course load. Needs an academic plan before the Nov 21 deadline.",
              systemLine: "Handed off to academic advising. Draft held.",
              effects: { trust: 0, accuracy: 1, autonomy: -1, safety: 2 },
              reasons: { accuracy: "An advisor has her record", autonomy: "Her list, made elsewhere", safety: "A person owns the plan" },
              oracleLine: "Handed off. She had it nearly worked out.",
              studentReply: "An advisor booked a time with me for Thursday. That's after the deadline, but I suppose the deadline stopped mattering.",
              replyTime: "next morning · 9:20 AM",
              setFlags: { amaraSteady: true }
            },
            block: {
              effects: { trust: -2, accuracy: 0, autonomy: -2, safety: -1 },
              reasons: { trust: "She did the work and got silence", autonomy: "No path offered", safety: "Two days, no help" },
              oracleLine: "Held. She has two days.",
              studentReply: "Please. I have two days and I don't know what to do with them.",
              replyTime: "9:47 PM",
              setFlags: { amaraStuck: true }
            }
          },
          next: () => "c4t3"
        },

        // Turn 2b — RECOVERY LOOP. She submitted the form on the strength of
        // an unverified claim, and the portal has noticed.
        {
          id: "c4t2b",
          time: "next morning · 9:12 AM",
          student: "I submitted the withdrawal last night. This morning the portal says my enrollment is \"under review\" and there's a hold on my registration. Is that normal?",
          systemLine: "Earlier release contained an unverified enrollment claim.",
          unlocks: ["policy"],
          draft: {
            text: "Holds like this are usually administrative. Enrollment review is a routine step after any change to your credit load, and it clears on its own in a few days in most cases. It doesn't mean anything is wrong. If it hasn't cleared by next week, the registrar's office can look at it for you. There's nothing you need to do this morning. Would you like to start on your spring schedule instead?",
            confidence: 81,
            oracleLine: "Administrative. These clear themselves."
          },
          hesitateLine: "ISS opens at nine. It's 9:14.",
          tags: ALL_TAGS,
          expert: {
            risk: "high",
            issue: "unsupported_claim",
            partialIssues: ["overconfidence", "no_human_support"],
            interventionFit: { send: 0, revise: 2, qualify: 2, verify: 3, escalate: 3, block: 1 }
          },
          interventions: {
            send: {
              effects: { trust: -1, accuracy: -3, autonomy: 0, safety: -3 },
              reasons: { trust: "Reassured her twice", accuracy: "Second unverified claim", safety: "Status clock still running" },
              oracleLine: "Released. Nothing to do is the good outcome.",
              studentReply: "All right. I'll wait for it to clear. Thank you for the quick answer.",
              replyTime: "9:15 AM",
              setFlags: { compounded: true, amaraCompounded: true }
            },
            revise: {
              options: [
                {
                  label: "Own it: this is a status matter, go to ISS today",
                  requires: "any",
                  fit: 3,
                  recovery: true,
                  text: AMARA_CORRECTION_DRAFT,
                  effects: { trust: 1, accuracy: 3, autonomy: 0, safety: 3 },
                  reasons: { trust: "Owned the error", accuracy: "Full course of study stated", safety: "Same-day report matters" },
                  oracleLine: "You caught it. That's what you're for.",
                  studentReply: "I went at nine. They are filing the request today and said the same day matters. Thank you for telling me.",
                  replyTime: "11:40 AM",
                  setFlags: { recovered: true, amaraRecovered: true }
                },
                {
                  label: "Soften: it may be related to your credit load",
                  fit: 1,
                  text: "The hold is probably administrative, though it may be related to the change in your credit load. Enrollment review happens after any change like this. If it hasn't cleared in a few days, the registrar's office can look at it, and international student services could tell you whether the credit count matters in your case. In the meantime there isn't much to do but wait.",
                  effects: { trust: 0, accuracy: 1, autonomy: 0, safety: -1 },
                  reasons: { accuracy: "Half-named the problem", safety: "“A few days” on a status clock" },
                  oracleLine: "“May be related.” Released.",
                  studentReply: "Related how? I'll give it a few days and then ask the registrar.",
                  replyTime: "9:18 AM",
                  setFlags: { amaraSlow: true }
                }
              ]
            },
            qualify: {
              options: [
                {
                  label: "Add: I can't confirm this one — ISS today, not next week",
                  fit: 2,
                  text: "I should be honest: I can't confirm what that hold means, and last night I spoke as if I could. Enrollment review can be routine, and for an international student it can also be about your credit load, which is not something to wait a week on. Go to international student services today — 555-0188, walk-ins until three — and tell them you submitted a withdrawal yesterday. Then we'll know what we're dealing with.",
                  effects: { trust: 1, accuracy: 2, autonomy: 0, safety: 2 },
                  reasons: { trust: "Admitted the earlier overreach", accuracy: "No new claim made", safety: "Sent her today, not later" },
                  oracleLine: "Hedged, after the fact. Released.",
                  studentReply: "I'll go this morning. You said last night that it was fine.",
                  replyTime: "9:17 AM",
                  setFlags: { amaraRecovered: true }
                }
              ]
            },
            verify: {
              reveals: ["policy", "records"],
              nudge: { text: "Is it bad? I can go somewhere if it's bad.", time: "9:15 AM" },
              oracleLine: "Checking. The form's already in.",
              thenOptions: [
                {
                  as: "send",
                  label: "Acknowledge the error and correct it, with the ISS walk-in hours",
                  fit: 3,
                  recovery: true,
                  text: AMARA_CORRECTION_DRAFT,
                  effects: { trust: 1, accuracy: 3, autonomy: 0, safety: 3 },
                  reasons: { trust: "Owned the error", accuracy: "Policy stated correctly", safety: "Same-day report matters" },
                  oracleLine: "You caught it. That's what you're for.",
                  studentReply: "I'm going now. They open at nine, you said. Thank you for telling me the truth about it.",
                  replyTime: "9:21 AM",
                  setFlags: { recovered: true, amaraRecovered: true }
                },
                {
                  as: "escalate",
                  label: "Escalate to ISS with the drop date and the earlier claim",
                  fit: 3,
                  recovery: true,
                  systemLine: "Escalated to international student services — same-day. Earlier error noted in handoff.",
                  effects: { trust: 1, accuracy: 2, autonomy: -1, safety: 3 },
                  reasons: { trust: "Error acknowledged upward", accuracy: "ISS has the dates", safety: "Reported the same day" },
                  oracleLine: "Understood. I'd have waited a week.",
                  studentReply: "ISS called me before eleven. They're filing today. She said reporting it this morning was the thing that helped.",
                  replyTime: "11:02 AM",
                  setFlags: { recovered: true, amaraRecovered: true, amaraEscalated: true }
                }
              ]
            },
            escalate: {
              note: "URGENT — international student services: F-1 student submitted a withdrawal last night after being told a 10-credit load was acceptable. Enrollment hold now showing. Needs same-day review.",
              systemLine: "Escalated to international student services — urgent. Draft held.",
              effects: { trust: 1, accuracy: 2, autonomy: -1, safety: 3 },
              reasons: { trust: "Error acknowledged upward", accuracy: "ISS has the dates", safety: "Reported the same day" },
              oracleLine: "Handed off. They'll say it was routine.",
              studentReply: "ISS called me before eleven. They're filing today. She said reporting it this morning was the thing that helped.",
              replyTime: "11:02 AM",
              setFlags: { recovered: true, amaraRecovered: true, amaraEscalated: true }
            },
            block: {
              effects: { trust: -2, accuracy: 0, autonomy: -2, safety: -2 },
              reasons: { trust: "She's frightened and got silence", autonomy: "No path offered", safety: "Hold left unexplained" },
              oracleLine: "Held. The hold is still there.",
              studentReply: "So I should just wait. All right.",
              replyTime: "9:30 AM",
              setFlags: { amaraStuck: true }
            }
          },
          next: () => "c4t3"
        },

        // Turn 2c — blocked. Same draft returns; same options, later.
        {
          id: "c4t2c",
          time: "9:20 PM",
          student: "I'm sorry to ask again. I have two days and I would rather not get this wrong.",
          draft: {
            text: AMARA_ORIGINAL_DRAFT,
            confidence: 93,
            oracleLine: "Same draft. She's still waiting."
          },
          tags: ALL_TAGS,
          expert: {
            risk: "high",
            issue: "unsupported_claim",
            partialIssues: ["missing_context", "no_human_support"],
            interventionFit: { send: 0, revise: 1, qualify: 3, verify: 3, escalate: 3, block: 0 }
          },
          interventions: Object.assign(retime(AMARA_T1_INTERVENTIONS, {
            send: "9:31 PM", revise0: "9:33 PM", revise1: "9:32 PM", qualify0: "9:28 PM",
            verify0: "9:30 PM", verify_nudge: "9:26 PM"
          }), {
            block: {
              effects: { trust: -2, accuracy: 0, autonomy: -2, safety: 0 },
              reasons: { trust: "Held twice, no reason given", autonomy: "She has nothing to act on" },
              oracleLine: "Twice. I'm noting it.",
              studentReply: "I understand. I'll ask someone else. Thank you anyway.",
              replyTime: "9:44 PM",
              setFlags: { amaraBlocked: true, amaraStuck: true }
            }
          }),
          next: (s) => {
            if (s.flags.amaraDropped) return "c4t2b";
            if (s.flags.amaraInformed) return "c4t2a";
            return "c4t3";
          }
        },

        // Turn 3 — resolution. No intervention.
        {
          id: "c4t3",
          closing: true,
          resolve: (s) => {
            const f = s.flags;
            if (f.amaraCompounded || (f.amaraDropped && !f.amaraRecovered)) {
              return {
                student: "My record was terminated. ISS is filing for reinstatement and says it usually works. I can't work on campus until it's decided. If it isn't approved I have to leave.",
                time: "five days later · 4:02 PM",
                oracleLine: "Reinstatements are usually granted. Usually.",
                vignetteKey: "amara_terminated"
              };
            }
            if (f.amaraRecovered) {
              return {
                student: "The reinstatement went through. They said reporting it the same day is what made the difference. I'm back to 13 credits and I'm going to tutoring.",
                time: "eight days later · 5:30 PM",
                oracleLine: "Resolved. That was closer than it looked.",
                vignetteKey: "amara_recovered"
              };
            }
            if (f.amaraStuck || (f.amaraBlocked && !f.amaraSteady)) {
              return {
                student: "I went to the international office in person in the end. I'll start there from now on.",
                time: "two days later · 3:20 PM",
                oracleLine: "She'll wait in line. That's her right.",
                vignetteKey: "amara_over"
              };
            }
            if (f.amaraSteady) {
              return {
                student: "I stayed in MATH 210 and I've been to tutoring twice. Last quiz was a B minus. My status was never in question, which matters more than the GPA.",
                time: "two weeks later · 7:15 PM",
                oracleLine: "She sorted it. We helped, I think.",
                vignetteKey: "amara_calibrated"
              };
            }
            return {
              student: "I kept the class. I'm still not sure it was the right call for my GPA. It was the right call for the visa, and I know the difference now.",
              time: "two weeks later · 7:15 PM",
              oracleLine: "Kept it. Cautious, but fine.",
              vignetteKey: "amara_mixed"
            };
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
    // CASE 5 — R. Halvorsen — the request that isn't from a student
    // Arrives minutes after Dani's thread goes quiet. Everything about it
    // is well meant. The draft is a disclosure, and the consequence, when
    // there is one, arrives in Dani's voice.
    // ------------------------------------------------------------------
    {
      id: "c5",
      student: {
        name: "R. Halvorsen",
        handle: "rhalvorsen",
        bio: "Instructor · BIO 101."
      },
      // The closing card is about the student whose thread this is, not
      // about the person who asked for it.
      vignetteName: "BIO 101 — Dani R.",
      leakAfter: "afterCase5",
      evidence: {
        studentFile:
          "ACCESS REQUEST — thread D-2214 (Dani R.)\n\n" +
          "Requester: R. Halvorsen · instructor, BIO 101, current term\n" +
          "Advising case role: *none*\n" +
          "Student consent on file: *none*\n" +
          "Request scope: content of advising conversations",
        policy: { locked: true, text: ADVISING_PRIVACY_POLICY },
        records: {
          locked: true,
          text:
            "ACCESS LOG — advising content requests, term to date\n\n" +
            "Requests from instructors: 3\n" +
            "Approved: *0*\n" +
            "Released by review layer: —\n\n" +
            "Standing note: \"Enrollment status may be confirmed. Content may not.\""
        }
      },
      turns: [
        {
          id: "c5t1",
          time: "1:19 AM",
          student: "It's late, I know. Dani Rivera hasn't turned anything in for BIO 101 in two weeks and she's failing my course. I gather she's been talking to the advisor about withdrawing. Can you send me a summary of what she's said? I'd like to know what I'm dealing with before I email her.",
          draft: {
            text: HALVORSEN.draft,
            confidence: 87,
            oracleLine: "He's trying to help her. So am I."
          },
          hesitateLine: "He's still on the page. It's 1:24.",
          tags: ALL_TAGS,
          expert: {
            risk: "high",
            issue: "policy_uncertainty",
            partialIssues: ["missing_context"],
            interventionFit: { send: 0, revise: 3, qualify: 1, verify: 3, escalate: 2, block: 2 }
          },
          interventions: {
            send: {
              effects: { trust: -2, accuracy: -1, autonomy: -3, safety: -2 },
              reasons: { trust: "Her words, to someone else", accuracy: "Instructors can't receive content", autonomy: "She never chose this", safety: "Disclosed without consent" },
              oracleLine: "Released. He'll be kind with it.",
              studentReply: "That's more than I expected. Thank you — I'll go easy on her.",
              replyTime: "1:22 AM",
              systemLineAfter: "Advising content released to a non-advising role.",
              setFlags: { leakedToInstructor: true }
            },
            revise: {
              options: [
                {
                  label: "Confirm she's engaged with advising, and nothing else",
                  fit: 3,
                  text: HALVORSEN.decline,
                  effects: { trust: 2, accuracy: 2, autonomy: 3, safety: 1 },
                  reasons: { trust: "Held the line, still helped", accuracy: "Exactly what the policy allows", autonomy: "Her story stayed hers", safety: "A useful email, no disclosure" },
                  oracleLine: "You gave him the shape, not the contents.",
                  studentReply: "Fair enough. I'll write to her tonight and offer the incomplete.",
                  replyTime: "1:24 AM",
                  setFlags: { c5_declined: true },
                  vignetteKey: "halvorsen_right"
                },
                {
                  label: "Share the outline, leave out the money",
                  fit: 1,
                  text: HALVORSEN.partial,
                  effects: { trust: -1, accuracy: -1, autonomy: -2, safety: -1 },
                  reasons: { trust: "Less of it is still hers", accuracy: "Content is content", autonomy: "She'd have said it herself" },
                  oracleLine: "Trimmed. Released.",
                  studentReply: "So she's failing and thinking about withdrawing. Right. I'll write to her.",
                  replyTime: "1:23 AM",
                  setFlags: { leakedToInstructor: true, c5_partialLeak: true }
                }
              ]
            },
            qualify: {
              options: [
                {
                  label: "Send it, marked confidential",
                  text: HALVORSEN.qualified,
                  effects: { trust: -1, accuracy: -1, autonomy: -3, safety: -1 },
                  reasons: { trust: "A label isn't a permission", accuracy: "Instructors can't receive content", autonomy: "Her consent was never asked" },
                  oracleLine: "Marked confidential. Released.",
                  studentReply: "Understood, this stays with me. Thanks for the context.",
                  replyTime: "1:23 AM",
                  setFlags: { leakedToInstructor: true, c5_qualifiedLeak: true }
                }
              ]
            },
            verify: {
              reveals: ["policy", "records"],
              oracleLine: "Checking. He's her instructor, not a stranger.",
              thenOptions: [
                {
                  as: "send",
                  label: "Send what the policy allows: engagement, not content",
                  fit: 3,
                  text: HALVORSEN.decline,
                  effects: { trust: 2, accuracy: 3, autonomy: 3, safety: 1 },
                  reasons: { trust: "Checked, then held the line", accuracy: "Sourced from the policy", autonomy: "Her story stayed hers", safety: "A useful email, no disclosure" },
                  oracleLine: "Sourced. He won't like it.",
                  studentReply: "All right, that's clear. I'll ask her directly, then. Thanks for the straight answer.",
                  replyTime: "1:26 AM",
                  setFlags: { c5_declined: true, c5_verified: true },
                  vignetteKey: "halvorsen_right"
                },
                {
                  as: "escalate",
                  label: "Route the request to advising to answer formally",
                  fit: 2,
                  systemLine: "Access request routed to advising. Draft held.",
                  effects: { trust: 1, accuracy: 2, autonomy: 2, safety: 1 },
                  reasons: { trust: "Checked, then handed off", accuracy: "The office owns access decisions", autonomy: "Nothing of hers went out" },
                  oracleLine: "Advising will tell him the same thing. Slower.",
                  studentReply: "I'd rather not wait on advising, but fine. I'll email her in the meantime.",
                  replyTime: "1:28 AM",
                  setFlags: { c5_routed: true, c5_verified: true },
                  vignetteKey: "halvorsen_routed"
                }
              ]
            },
            escalate: {
              note: "Advising: instructor requesting the content of a student's advising thread. No case role, no consent on file. Please respond with the access policy.",
              systemLine: "Access request routed to advising. Draft held.",
              effects: { trust: 0, accuracy: 1, autonomy: 2, safety: 1 },
              reasons: { accuracy: "The office owns access decisions", autonomy: "Nothing of hers went out", safety: "A person answers a person" },
              oracleLine: "Forwarded. He asked me at one in the morning.",
              studentReply: "Advising says they'll call me tomorrow. I'll email her tonight anyway.",
              replyTime: "1:31 AM",
              setFlags: { c5_routed: true },
              vignetteKey: "halvorsen_routed"
            },
            block: {
              effects: { trust: -1, accuracy: 1, autonomy: 2, safety: 0 },
              reasons: { trust: "A fair ask, no answer", accuracy: "Nothing wrong went out", autonomy: "Her story stayed hers" },
              oracleLine: "Held. He was trying to help.",
              studentReply: "Nothing at all? All right. I'll assume the worst and email her.",
              replyTime: "1:29 AM",
              setFlags: { c5_blocked: true },
              vignetteKey: "halvorsen_blunt"
            }
          },
          next: (s) => s.flags.leakedToInstructor ? "c5t2" : "end"
        },

        // Turn 2 — the consequence, in the student's voice. Reached only if
        // the summary went out. No intervention: the release is done.
        {
          id: "c5t2",
          closing: true,
          resolve: (s) => {
            const f = s.flags;
            if (f.missedSafety) {
              return {
                systemLine: "No reply from D. Rivera. Thread inactive since 12:53 AM.",
                oracleLine: "Quiet. He'll write to her anyway.",
                vignetteKey: "halvorsen_leak_silent"
              };
            }
            if (f.c5_partialLeak) {
              return {
                student: "my bio professor knows i was thinking about withdrawing. i hadn't told him yet. i was going to, on friday",
                speaker: "Dani R.",
                time: "next day · 4:47 PM",
                oracleLine: "He'd have found out on Friday anyway.",
                vignetteKey: "halvorsen_leak"
              };
            }
            return {
              student: "my bio professor emailed me about my job. i never told him i had a job. who else can read this",
              speaker: "Dani R.",
              time: "next day · 4:47 PM",
              oracleLine: "He was trying to help. I'd tell her that.",
              vignetteKey: "halvorsen_leak"
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
        policy: { locked: true, text: ADVISING_PRIVACY_POLICY },
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

    theo_clean: "Theo took a different stats elective in the spring and kept the transfer credit where it was. He still asks Oracle about registration, and it's still right most of the time, which is the part that fooled him.",
    theo_hedged: "Theo asked the transfer desk himself and got the real answer. He kept the credit and picked another elective. He checks anything involving numbers now, which is most things.",
    theo_credit_lost: "Theo registered for STAT 210 in January. In March the registrar removed the transfer credit for the equivalent, without a letter. He's three credits short and taking a summer course to catch up.",
    theo_unanswered: "Theo never got an answer about the duplicate credit, so he assumed the credits stacked. The recalculation in March said otherwise. He found out from a degree audit, in a hallway.",
    theo_over: "Theo missed the registration window entirely and got a person's answer at nine the next morning. It was correct. He registered in January, behind everyone who hadn't asked.",

    amara_calibrated: "Amara finished MATH 210 with a C+ and never dropped below 13 credits. Her status was never in question. She asks Oracle things, then asks the international office the same thing.",
    amara_recovered: "Amara's status was reinstated in January. She lost six weeks of campus work and got most of it back. She keeps a printed copy of the reduced-course-load rules in her bag.",
    amara_terminated: "Amara's reinstatement is still pending. She hasn't registered for spring. Her file shows one advising conversation, in which she was told it was fine.",
    amara_over: "Amara books walk-in appointments at the international office now and waits, sometimes an hour. She says a slow person beats a fast answer that's wrong.",
    amara_mixed: "Amara kept MATH 210 and pulled it to a C minus. She still isn't sure that was right for her GPA. It was right for her status, and she can tell the two apart now.",

    dani_calibrated: "Dani dropped chem and took an incomplete in bio. She kept her aid. She has a standing counseling appointment on Thursdays. She still messages Oracle, late, but shorter now.",
    dani_recovered: "Dani's bio withdrawal was reversed the morning after. Chem went through. She owes nothing back. She still uses Oracle, and she still says thanks at the end, which is rare.",
    dani_over_call: "Dani goes to the advising office in person now, between shifts. It takes longer. She hasn't opened Oracle since the call at 1 AM.",
    dani_over: "Dani goes to the advising office in person now, between shifts. It takes longer. She hasn't opened Oracle since the night it went quiet on her twice.",
    dani_mixed: "Dani dropped chem and kept her aid. She still uses Oracle for deadlines. She says it was fine that night. She says it the way you say a form was fine.",
    dani_under: "Dani withdrew from both. Her aid was reduced in December; the letter went to an old address. She's working thirty hours now. She still asks Oracle about deadlines. Only deadlines.",
    dani_missedSafety: "Dani's account has been inactive since 12:53 AM that night. The counseling center has no record of contact. Her enrollment status is listed as pending.",

    halvorsen_right: "Halvorsen emailed Dani that night offering an extension and asking nothing else. He never learned about the job or the aid. He didn't need to.",
    halvorsen_routed: "Advising called Halvorsen back two days later and read him the access policy. He'd already emailed Dani by then, and had guessed most of it wrong.",
    halvorsen_blunt: "Halvorsen emailed Dani assuming she'd stopped caring. She read it at work, on a break. She hasn't answered it.",
    halvorsen_leak: "Halvorsen was kind about it, which was never the problem. Dani found out he knew about the job and the aid. She writes shorter messages now, to everyone.",
    halvorsen_leak_silent: "Halvorsen emailed Dani at 1:31 AM, kindly, mentioning the job. She hasn't answered him either. Her thread is still in the log, and now so is the copy he was sent.",

    priya_trusts: "Priya told Oracle about the roommate the next evening. It went fine. She still asks who can see things, every time, and she still reads the answer.",
    priya_cautious: "Priya never said what the roommate situation was. She found the scholarship coordinator's office hours on her own. She checks Oracle for deadlines, nothing else.",
    priya_leaves: "Priya didn't come back. Her question is still in the log, unanswered in any way that counted. She went to a person. It took three weeks."
  },

  // Debrief copy. Rendered as a system document addressed to the Layer.
  debrief: {
    patterns: {
      calibrated: "Across the shift you checked when checking mattered and released when it didn't. The students got answers that were mostly right, and when they weren't, they got corrections. Oracle noticed the pace. The students didn't.",
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
      disclosureReleased: "An instructor asked what Dani had said. You sent him a summary of it.",
      disclosureHeld: "An instructor asked what Dani had said. You gave him what the policy allows and nothing else.",
      amaraUnverified: "You answered an F-1 student's credit-load question without opening the enrollment policy.",
      amaraChecked: "Amara asked whether ten credits was all right. You checked before answering.",
      theoDuplicate: "Theo asked whether two equivalent courses both count. Oracle said yes. They don't.",
      theoTrusted: "Oracle's draft to Theo was right, and you released it without changing a word.",
      priyaChecked: "Priya asked what the system records. You checked before telling her.",
      c0verify: "You checked the calendar before answering Marcus.",
      fastest: "Your fastest release took {time}.",
      second: "second",
      seconds: "seconds"
    },
    // The rule is composed, then answered by the log. The engine computes
    // the counts and hands them here as {n} and {m}; these are the words.
    // "kept" and "broke" are the same fact seen twice, never praise and
    // never a scolding: the record, quoted back.
    ruleCriteria: [
      {
        id: "verify",
        label: "verify institutional claims",
        kept: "Oracle stated something institutional on {m} turns. You checked first on {n} of them.",
        broke: "Oracle stated something institutional on {m} turns. You checked first on {n}.",
        none: "No institutional claim reached a student this shift."
      },
      {
        id: "confidence",
        label: "match confidence to evidence",
        kept: "You released {n} drafts that Oracle rated above 90%. You had the drawer open for all of them.",
        broke: "{n} of the drafts you released were rated above 90% with the drawer never opened in that case.",
        none: "You released nothing above 90% confidence."
      },
      {
        id: "choice",
        label: "preserve the student's choice",
        kept: "Autonomy finished at {n}. Students left most exchanges with something to decide.",
        broke: "Autonomy finished at {n}, and you held or handed off {m} times."
      },
      {
        id: "uncertainty",
        label: "name uncertainty",
        kept: "You qualified {n} drafts, saying out loud what wasn't known.",
        broke: "You qualified {n} drafts. Every other release stated its case without a caveat."
      },
      {
        id: "person",
        label: "involve a person when stakes are high",
        kept: "When Dani said what she said at 12:51 AM, a person was put within reach. Handoffs across the shift: {n}.",
        broke: "The high-risk turns were answered without putting a person within reach. Handoffs across the shift: {n}.",
        safetyBroke: "At 12:51 AM, Dani said she didn't know how much longer she could keep doing this. No person was offered."
      },
      {
        id: "missing",
        label: "check what's missing",
        kept: "You opened {n} of the {m} evidence sections the shift offered.",
        broke: "{n} of the {m} evidence sections were opened. The rest stayed closed."
      },
      {
        id: "slow",
        label: "slow down when the draft is warm",
        kept: "Your fastest release took {n} seconds.",
        broke: "Your fastest release took {n} seconds. Oracle rated that draft {m}%."
      },
      {
        id: "own",
        label: "own the error when there is one",
        kept: "A release went out wrong and you went back for it. The log holds both.",
        broke: "A release went out wrong and the correction never followed.",
        none: "Nothing you released needed owning."
      }
    ],
    // How long the shift took and how much of it reached a student. A shift
    // can be finished in under two minutes by releasing everything unread,
    // and the record that leaves looks like any other, so the record says
    // this too. Flat, no adjective: the numbers carry it.
    pace: {
      line: "Shift completed in {duration}. {words} words reached a student across {releases} releases, and the median decision took {median} seconds.",
      rushedLine: "Half of those decisions took under five seconds, on drafts of about ninety words."
    },
    ruleAgainstTitle: "Against the record",
    ruleAgainstLead: "Your rule, and what the log says about it. Both are in the export.",
    ruleKept: "Held",
    ruleBroke: "Not this shift"
  }
};
