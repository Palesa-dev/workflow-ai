import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, SendHorizontal, Trash2 } from "lucide-react";
import logo from "@/assets/workmate-logo.png";
import { chatReply } from "@/lib/ai.functions";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/Markdown";
import { ErrorState, PageHeading, ResponsibleAIBanner } from "@/components/ai/AiPanels";
import type { ChatMessage } from "@/types";

export const Route = createFileRoute("/ai-chat")({
  head: () => ({
    meta: [
      { title: "AI Workplace Chat — FlowMate AI" },
      {
        name: "description",
        content:
          "Chat with FlowMate AI about emails, meetings, priorities, productivity and business concepts.",
      },
      { property: "og:title", content: "AI Workplace Chat — FlowMate AI" },
      {
        property: "og:description",
        content: "A conversational AI assistant for everyday workplace questions.",
      },
    ],
  }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "Help me write a professional email.",
  "Help me prioritize my tasks.",
  "Give me ideas for improving team productivity.",
  "Explain this business concept: unit economics.",
];

function timeOf(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ChatPage() {
  const { settings } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const call = useServerFn(chatReply);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: ChatMessage[] = [
      ...messages,
      { id: crypto.randomUUID(), role: "user", content: trimmed, at: Date.now() },
    ];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const res = await call({
        data: {
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          length: settings.responseLength,
        },
      });
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: res.text, at: Date.now() },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMessages((prev) => prev.filter((m) => m.id !== lastUser.id));
    void send(lastUser.content);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeading
          title="AI Workplace Chat"
                description="Ask anything about your work — FlowMate AI keeps the conversation in context."
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMessages([]);
            setError(null);
          }}
          disabled={!messages.length || loading}
        >
          <Trash2 className="size-4" />
          Clear conversation
        </Button>
      </div>

      <div className="surface-card flex h-[calc(100vh-19rem)] min-h-[26rem] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <img
                src={logo}
                alt="FlowMate AI"
                width={48}
                height={48}
                loading="lazy"
                className="size-12"
              />
              <p className="text-sm font-medium text-foreground">
                Start a conversation with FlowMate AI
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Try one of the suggested prompts below or ask your own workplace question.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div className={m.role === "user" ? "max-w-[85%]" : "max-w-[92%]"}>
                  {m.role === "user" ? (
                    <div className="rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      {m.content}
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <img
                        src={logo}
                        alt=""
                        width={28}
                        height={28}
                        loading="lazy"
                        className="mt-0.5 size-7 shrink-0"
                      />
                      <div className="min-w-0">
                        <Markdown content={m.content} />
                      </div>
                    </div>
                  )}
                  <p
                    className={`mt-1 text-[11px] text-muted-foreground ${
                      m.role === "user" ? "text-right" : "pl-10"
                    }`}
                  >
                    {timeOf(m.at)}
                  </p>
                </div>
              </div>
            ))
          )}

          {loading ? (
            <div className="flex items-center gap-2 pl-1 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              AI is thinking...
            </div>
          ) : null}

          {error ? <ErrorState message={error} onRetry={retry} /> : null}

          <div ref={endRef} />
        </div>

        <div className="space-y-3 border-t border-border p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void send(s)}
                disabled={loading}
                className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask FlowMate AI about emails, meetings, priorities..."
              rows={2}
              className="min-h-[52px] resize-none"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || loading} aria-label="Send">
              <SendHorizontal className="size-4" />
            </Button>
          </form>
        </div>
      </div>

      <ResponsibleAIBanner />
    </div>
  );
}
