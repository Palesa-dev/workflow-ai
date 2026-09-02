import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { RotateCcw, Search } from "lucide-react";
import { researchTopic } from "@/lib/ai.functions";
import { useAiAction } from "@/hooks/useAiAction";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export const Route = createFileRoute("/research-assistant")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — WorkMate AI" },
      {
        name: "description",
        content:
          "Get structured workplace research with an overview, key findings, insights, recommendations and next steps.",
      },
      { property: "og:title", content: "AI Research Assistant — WorkMate AI" },
      {
        property: "og:description",
        content: "Structured research briefings for business questions and topics.",
      },
    ],
  }),
  component: ResearchPage,
});

const EXAMPLE = "What are the benefits of AI automation in modern businesses?";

function ResearchPage() {
  const { settings } = useAppStore();
  const [topic, setTopic] = useState("");
  const call = useServerFn(researchTopic);
  const action = useAiAction((data: Parameters<typeof researchTopic>[0]["data"]) =>
    call({ data }),
  );

  const submit = () => void action.run({ topic, length: settings.responseLength });
  const clear = () => {
    setTopic("");
    action.reset();
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="AI Research Assistant"
        description="Ask a workplace question and receive a structured briefing you can share."
      />

      <WorkspaceLayout
        input={
          <Panel title="Research request" description="Be specific for sharper findings.">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="topic">Topic or question</Label>
                <Textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={EXAMPLE}
                  rows={8}
                />
                <button
                  type="button"
                  onClick={() => setTopic(EXAMPLE)}
                  className="text-xs text-primary hover:underline"
                >
                  Use example question
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={submit} disabled={!topic.trim() || action.loading}>
                  <Search className="size-4" />
                  {action.loading ? "Researching..." : "Research topic"}
                </Button>
                <Button variant="ghost" onClick={clear} disabled={action.loading}>
                  <RotateCcw className="size-4" />
                  Clear
                </Button>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
                AI-generated research should be verified against reliable sources before it is used
                for important decisions.
              </div>
              <ResponsibleAIBanner compact />
            </div>
          </Panel>
        }
        output={
          <Panel
            title="Research briefing"
            description="Overview, findings, insights, recommendations and next steps."
            actions={
              action.result ? (
                <>
                  <CopyButton value={action.result.text} label="Copy response" />
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
                title="No research yet"
                hint="Enter a topic or question on the left to generate a structured briefing."
              />
            )}
          </Panel>
        }
      />
    </div>
  );
}
