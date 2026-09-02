import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { RotateCcw, Wand2 } from "lucide-react";
import { summarizeMeeting } from "@/lib/ai.functions";
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

export const Route = createFileRoute("/meeting-summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — WorkMate AI" },
      {
        name: "description",
        content:
          "Turn long meeting notes into a concise summary with key decisions, action items, owners and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — WorkMate AI" },
      {
        property: "og:description",
        content: "Summaries, decisions, action items and deadlines from raw meeting notes.",
      },
    ],
  }),
  component: MeetingSummarizerPage,
});

const EXAMPLE = `Discussed Q4 marketing campaign. Sarah will prepare the campaign proposal by Friday.
Daniel raised concerns about the media budget and will confirm final numbers by next Tuesday.
Team agreed to move the launch review one week earlier. Stakeholder sign-off is still pending.
Weekly reporting cadence stays as is. Someone needs to draft the launch checklist before the next review.`;

function MeetingSummarizerPage() {
  const { settings, bump } = useAppStore();
  const [notes, setNotes] = useState("");
  const call = useServerFn(summarizeMeeting);
  const action = useAiAction((data: Parameters<typeof summarizeMeeting>[0]["data"]) =>
    call({ data }),
  );

  const submit = async () => {
    const res = await action.run({ notes, length: settings.responseLength });
    if (res) bump("meetingsSummarized");
  };

  const clear = () => {
    setNotes("");
    action.reset();
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Meeting Notes Summarizer"
        description="Paste raw notes and get a structured summary your team can act on."
      />

      <WorkspaceLayout
        input={
          <Panel title="Meeting notes" description="Paste the full notes — length is fine.">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Paste your meeting notes here..."
                  rows={14}
                />
                <button
                  type="button"
                  onClick={() => setNotes(EXAMPLE)}
                  className="text-xs text-primary hover:underline"
                >
                  Load example notes
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={submit} disabled={!notes.trim() || action.loading}>
                  <Wand2 className="size-4" />
                  {action.loading ? "Summarizing..." : "Summarize"}
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
            title="Summary"
            description="Summary, decisions, action items, deadlines and key points."
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
                title="No summary yet"
                hint="Paste your meeting notes and click Summarize to extract decisions, owners and deadlines."
              />
            )}
          </Panel>
        }
      />
    </div>
  );
}
