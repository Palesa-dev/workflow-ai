import type { EmailTone } from "@/types";

/** Deterministic demo responses used when no AI API key is configured. */

export function mockEmail(prompt: string, recipient: string, tone: EmailTone) {
  const to = recipient.trim() || "the recipient";
  return `**Subject:** Follow-up regarding ${prompt.slice(0, 48) || "our recent discussion"}

Dear ${to},

I hope this message finds you well. I am writing regarding ${prompt || "the matter below"}.

Having reviewed the current status, I wanted to share a clear summary of where things stand and outline the next steps so we can keep progress on track. Please let me know if you need any additional context or supporting material from my side.

I would be glad to discuss this further at a time that suits you.

Kind regards,
Alex Morgan
(${tone} tone — demo response)`;
}

export function mockMeeting(_notes: string) {
  return `## Meeting Summary
The team reviewed campaign progress, confirmed budget assumptions and agreed on the launch sequence for the coming quarter.

## Key Decisions
- Proceed with the proposed campaign concept
- Keep the existing budget envelope unchanged
- Move the launch review one week earlier

## Action Items
- **Prepare campaign proposal** — Sarah — Friday
- **Confirm media budget** — Daniel — Next Tuesday
- **Draft launch checklist** — Unassigned — Before the next review

## Deadlines
- Campaign proposal: Friday
- Budget confirmation: Next Tuesday

## Important Points
- Stakeholder sign-off is still pending
- Reporting cadence stays weekly

_Demo response — configure an AI key for live results._`;
}

export function mockResearch(topic: string) {
  return `## Overview
${topic || "The topic"} is increasingly relevant for organisations seeking measurable productivity gains.

## Key Findings
- Adoption is fastest in operations and customer support
- Measurable gains come from workflow redesign, not tools alone
- Governance maturity strongly predicts long-term value

## Important Facts
- Most programmes report benefits within two to three quarters
- Change management is the most cited failure point

## Insights
Value is concentrated where repetitive, high-volume work meets clear quality criteria.

## Recommendations
- Start with one measurable workflow
- Define success metrics before rollout
- Keep a human review step for customer-facing output

## Suggested Next Steps
1. Map candidate workflows
2. Run a scoped pilot
3. Review results and expand deliberately

_Demo response — verify all findings against reliable sources._`;
}

export function mockPlan(tasks: string) {
  const items = tasks
    .split(/[,\n;]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 6);
  const list = items.length ? items : ["Focus block", "Email triage", "Team sync"];
  const priorities = ["high", "medium", "low"] as const;
  return JSON.stringify({
    tasks: list.map((name, i) => ({
      name,
      priority: priorities[i % 3],
      start: `${String(9 + i).padStart(2, "0")}:00`,
      duration: i % 2 === 0 ? "60 min" : "45 min",
      deadline: i === 0 ? "Today" : undefined,
      note: "Demo schedule — configure an AI key for live planning.",
    })),
  });
}

export function mockChat(message: string) {
  return `Happy to help with **${message.slice(0, 60) || "that"}**.

Here is how I would approach it:

1. Clarify the outcome you need
2. Break the work into two or three concrete steps
3. Decide what "done" looks like

Tell me more about the context and I can draft the full content for you.

_Demo response — configure an AI key for live answers._`;
}
