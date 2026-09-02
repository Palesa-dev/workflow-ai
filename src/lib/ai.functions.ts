import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const lengthSchema = z.enum(["short", "medium", "detailed"]).optional();

const emailSchema = z.object({
  prompt: z.string().min(1),
  recipient: z.string().optional().default(""),
  tone: z.enum(["formal", "friendly", "persuasive", "professional"]),
  length: lengthSchema,
});

const notesSchema = z.object({ notes: z.string().min(1), length: lengthSchema });

const planSchema = z.object({
  tasks: z.string().min(1),
  date: z.string().optional().default(""),
  hours: z.string().optional().default(""),
  priority: z.enum(["high", "medium", "low"]),
  deadlines: z.string().optional().default(""),
  length: lengthSchema,
});

const researchSchema = z.object({ topic: z.string().min(1), length: lengthSchema });

const chatSchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).min(1),
  length: lengthSchema,
});

export type EmailInput = z.input<typeof emailSchema>;
export type NotesInput = z.input<typeof notesSchema>;
export type PlanInput = z.input<typeof planSchema>;
export type ResearchInput = z.input<typeof researchSchema>;
export type ChatInput = z.input<typeof chatSchema>;

const BASE =
  "You are WorkMate AI, a professional workplace productivity assistant for business users. Write in clear, business-appropriate English.";

function toError(e: unknown): never {
  const message = e instanceof Error ? e.message : "The AI request failed. Please try again.";
  throw new Error(message);
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => emailSchema.parse(d))
  .handler(async ({ data }) => {
    const { runAi } = await import("./ai.server");
    const { mockEmail } = await import("./ai-mocks");
    try {
      return await runAi(
        [
          {
            role: "system",
            content: `${BASE} Write complete emails containing: a "**Subject:**" line, a greeting, a well-structured body and a professional closing with a sign-off. Output only the email.`,
          },
          {
            role: "user",
            content: `Tone: ${data.tone}\nRecipient / context: ${data.recipient || "not specified"}\nGoal of the email: ${data.prompt}`,
          },
        ],
        { length: data.length, mockFallback: () => mockEmail(data.prompt, data.recipient, data.tone) },
      );
    } catch (e) {
      toError(e);
    }
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => notesSchema.parse(d))
  .handler(async ({ data }) => {
    const { runAi } = await import("./ai.server");
    const { mockMeeting } = await import("./ai-mocks");
    try {
      return await runAi(
        [
          {
            role: "system",
            content: `${BASE} Summarize meeting notes using exactly these markdown H2 sections in order: "Meeting Summary", "Key Decisions", "Action Items", "Deadlines", "Important Points". Each action item must be a bullet in the form "**Task** — Owner — Deadline", using "Unassigned" or "No deadline" when not identifiable.`,
          },
          { role: "user", content: `Meeting notes:\n\n${data.notes}` },
        ],
        { length: data.length, mockFallback: () => mockMeeting(data.notes) },
      );
    } catch (e) {
      toError(e);
    }
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => planSchema.parse(d))
  .handler(async ({ data }) => {
    const { runAi } = await import("./ai.server");
    const { mockPlan } = await import("./ai-mocks");
    try {
      const result = await runAi(
        [
          {
            role: "system",
            content: `${BASE} You build realistic work schedules. Respond with JSON ONLY (no markdown fences) matching: {"tasks":[{"name":string,"priority":"high"|"medium"|"low","start":string,"duration":string,"deadline":string|null,"note":string}]}. Order tasks sensibly across the available working hours.`,
          },
          {
            role: "user",
            content: `Tasks: ${data.tasks}\nDate: ${data.date || "today"}\nAvailable working hours: ${data.hours || "9:00-17:00"}\nDefault priority: ${data.priority}\nKnown deadlines: ${data.deadlines || "none"}`,
          },
        ],
        { length: data.length, mockFallback: () => mockPlan(data.tasks) },
      );
      return result;
    } catch (e) {
      toError(e);
    }
  });

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => researchSchema.parse(d))
  .handler(async ({ data }) => {
    const { runAi } = await import("./ai.server");
    const { mockResearch } = await import("./ai-mocks");
    try {
      return await runAi(
        [
          {
            role: "system",
            content: `${BASE} Produce workplace research using exactly these markdown H2 sections in order: "Overview", "Key Findings", "Important Facts", "Insights", "Recommendations", "Suggested Next Steps". Be factual and avoid fabricated statistics.`,
          },
          { role: "user", content: `Research request: ${data.topic}` },
        ],
        { length: data.length, mockFallback: () => mockResearch(data.topic) },
      );
    } catch (e) {
      toError(e);
    }
  });

export const chatReply = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => chatSchema.parse(d))
  .handler(async ({ data }) => {
    const { runAi } = await import("./ai.server");
    const { mockChat } = await import("./ai-mocks");
    const last = data.messages[data.messages.length - 1]?.content ?? "";
    try {
      return await runAi(
        [
          {
            role: "system",
            content: `${BASE} You are in a chat conversation. Answer workplace questions helpfully and practically. Use short paragraphs and bullet lists where useful.`,
          },
          ...data.messages,
        ],
        { length: data.length, mockFallback: () => mockChat(last) },
      );
    } catch (e) {
      toError(e);
    }
  });
