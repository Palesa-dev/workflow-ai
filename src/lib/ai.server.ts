const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

export type AiLength = "short" | "medium" | "detailed";

export type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const lengthHint: Record<AiLength, string> = {
  short: "Be concise. Keep the response tight and skimmable.",
  medium: "Use a balanced level of detail.",
  detailed: "Be thorough and include supporting detail.",
};

/**
 * Single low-level entry point to the AI provider.
 * Falls back to a deterministic demo response when no key is configured,
 * so the whole product stays usable without an AI API.
 */
export async function runAi(
  messages: ChatTurn[],
  opts: { length?: AiLength | undefined; mockFallback: () => string },
): Promise<{ text: string; demo: boolean }> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return { text: opts.mockFallback(), demo: true };

  const system = messages.find((m) => m.role === "system");
  const rest = messages.filter((m) => m.role !== "system");
  const payload: ChatTurn[] = [
    {
      role: "system",
      content: `${system?.content ?? "You are WorkMate AI, a professional workplace assistant."}\n\n${
        lengthHint[opts.length ?? "medium"]
      }\nFormat your answer in clean markdown using the requested section headings. Never invent confidential data.`,
    },
    ...rest,
  ];

  let res: Response;
  try {
    res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: MODEL, messages: payload }),
    });
  } catch {
    throw new AiError("Could not reach the AI service. Please try again.", 503);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let message = body;
    try {
      message = JSON.parse(body)?.error?.message ?? body;
    } catch {
      /* keep raw body */
    }
    if (res.status === 429)
      throw new AiError("Too many requests right now. Please wait a moment and retry.", 429);
    if (res.status === 402)
      throw new AiError(
        message || "AI credits are exhausted. Add credits in Lovable to continue.",
        402,
      );
    if (res.status === 403)
      throw new AiError(message || "AI access is blocked by workspace policy.", 403);
    throw new AiError(message || `AI request failed (${res.status}).`, res.status);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new AiError("The AI returned an empty response. Try again.", 502);
  return { text, demo: false };
}
