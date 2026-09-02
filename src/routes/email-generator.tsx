import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Send, RotateCcw } from "lucide-react";
import { generateEmail } from "@/lib/ai.functions";
import { useAiAction } from "@/hooks/useAiAction";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AiOutput,
  CopyButton,
  DemoNotice,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
  Panel,
  RegenerateButton,
  ResponsibleAIBanner,
  WorkspaceLayout,
} from "@/components/ai/AiPanels";
import type { EmailTone } from "@/types";

export const Route = createFileRoute("/email-generator")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — WorkMate AI" },
      {
        name: "description",
        content:
          "Generate complete professional emails with subject, greeting, body and sign-off in your chosen tone.",
      },
      { property: "og:title", content: "Smart Email Generator — WorkMate AI" },
      {
        property: "og:description",
        content: "AI-written business emails with a tone that fits the moment.",
      },
    ],
  }),
  component: EmailGeneratorPage,
});

const EXAMPLE =
  "Write an email to my manager requesting an extension on the quarterly report.";

function EmailGeneratorPage() {
  const { settings, bump } = useAppStore();
  const [prompt, setPrompt] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<EmailTone>(settings.defaultTone);
  const call = useServerFn(generateEmail);
  const action = useAiAction((data: Parameters<typeof generateEmail>[0]["data"]) =>
    call({ data }),
  );

  const submit = async () => {
    const res = await action.run({
      prompt,
      recipient,
      tone,
      length: settings.responseLength,
    });
    if (res) bump("emailsGenerated");
  };

  const clear = () => {
    setPrompt("");
    setRecipient("");
    action.reset();
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Smart Email Generator"
        description="Describe what you need to say and WorkMate AI will write a complete, professional email."
      />

      <WorkspaceLayout
        input={
          <Panel title="Email brief" description="Tell the assistant what this email must achieve.">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="prompt">What should the email communicate?</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={EXAMPLE}
                  rows={6}
                />
                <button
                  type="button"
                  onClick={() => setPrompt(EXAMPLE)}
                  className="text-xs text-primary hover:underline"
                >
                  Use example brief
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="recipient">Recipient / context (optional)</Label>
                <Input
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Priya Naidoo, Finance Director"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as EmailTone)}>
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button onClick={submit} disabled={!prompt.trim() || action.loading}>
                  <Send className="size-4" />
                  {action.loading ? "Generating..." : "Generate email"}
                </Button>
                <Button variant="ghost" onClick={clear} disabled={action.loading}>
                  <RotateCcw className="size-4" />
                  Clear
                </Button>
              </div>

              <ResponsibleAIBanner compact />
            </div>
          </Panel>
        }
        output={
          <Panel
            title="Generated email"
            description="Review before sending."
            actions={
              action.result ? (
                <>
                  <CopyButton value={action.result.text} />
                  <RegenerateButton onClick={submit} disabled={action.loading} />
                </>
              ) : null
            }
          >
            {action.loading ? (
              <LoadingState />
            ) : action.error ? (
              <ErrorState message={action.error} onRetry={action.retry} />
            ) : action.result ? (
              <div className="space-y-3">
                <AiOutput content={action.result.text} />
                {action.result.demo ? <DemoNotice /> : null}
              </div>
            ) : (
              <EmptyState
                title="No email yet"
                hint="Add a brief on the left and generate your email — subject, greeting, body and sign-off included."
              />
            )}
          </Panel>
        }
      />
    </div>
  );
}
