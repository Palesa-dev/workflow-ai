export type EmailTone = "formal" | "friendly" | "persuasive" | "professional";
export type Priority = "high" | "medium" | "low";
export type TaskStatus = "not-started" | "in-progress" | "completed";
export type ResponseLength = "short" | "medium" | "detailed";

export type PlannedTask = {
  id: string;
  name: string;
  priority: Priority;
  start: string;
  duration: string;
  deadline?: string;
  status: TaskStatus;
  note?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: number;
};

export type AiResult = { text: string; demo: boolean };
