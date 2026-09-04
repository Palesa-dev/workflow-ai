import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, Clock, RotateCcw } from "lucide-react";
import { planTasks, type PlanInput } from "@/lib/ai.functions";
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
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import {
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
import type { PlannedTask, Priority, TaskStatus } from "@/types";

export const Route = createFileRoute("/task-planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — FlowMate AI" },
      {
        name: "description",
        content:
          "Turn a list of tasks into an organized daily schedule with priorities, time blocks, deadlines and status tracking.",
      },
      { property: "og:title", content: "AI Task Planner — FlowMate AI" },
      {
        property: "og:description",
        content: "AI-built daily schedules with priorities, durations and progress tracking.",
      },
    ],
  }),
  component: TaskPlannerPage,
});

const EXAMPLE =
  "Complete quarterly report, prepare presentation, respond to client emails, review budget.";

type RawTask = {
  name?: string;
  priority?: string;
  start?: string;
  duration?: string;
  deadline?: string | null;
  note?: string;
};

function parsePlan(text: string, fallbackPriority: Priority): PlannedTask[] {
  const match = /\{[\s\S]*\}/.exec(text);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as { tasks?: RawTask[] };
    return (parsed.tasks ?? []).map((t, i) => ({
      id: `${Date.now()}-${i}`,
      name: t.name?.trim() || `Task ${i + 1}`,
      priority: (["high", "medium", "low"] as const).includes(t.priority as Priority)
        ? (t.priority as Priority)
        : fallbackPriority,
      start: t.start || "—",
      duration: t.duration || "—",
      ...(t.deadline ? { deadline: t.deadline } : {}),
      status: "not-started" as TaskStatus,
      ...(t.note ? { note: t.note } : {}),
    }));
  } catch {
    return [];
  }
}

function TaskPlannerPage() {
  const { settings, tasks, setTasks, setTaskStatus } = useAppStore();
  const [taskText, setTaskText] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState("09:00 - 17:00");
  const [priority, setPriority] = useState<Priority>(settings.defaultPriority);
  const [deadlines, setDeadlines] = useState("");
  const [demo, setDemo] = useState(false);

  const call = useServerFn(planTasks);
  const action = useAiAction((data: PlanInput) => call({ data }));

  const submit = async () => {
    const res = await action.run({
      tasks: taskText,
      date,
      hours,
      priority,
      deadlines,
      length: settings.responseLength,
    });
    if (res) {
      setDemo(res.demo);
      setTasks(parsePlan(res.text, priority));
    }
  };

  const clear = () => {
    setTaskText("");
    setDeadlines("");
    setTasks([]);
    action.reset();
  };

  const copyText = tasks
    .map(
      (t) =>
        `${t.start} · ${t.name} (${t.priority}, ${t.duration}${t.deadline ? `, due ${t.deadline}` : ""})`,
    )
    .join("\n");

  return (
    <div className="space-y-6">
      <PageHeading
        title="AI Task Planner"
        description="List what you need to get done and FlowMate AI will build a realistic schedule."
      />

      <WorkspaceLayout
        input={
          <Panel title="Plan setup" description="Add your tasks and working constraints.">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="tasks">Tasks</Label>
                <Textarea
                  id="tasks"
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  placeholder={EXAMPLE}
                  rows={5}
                />
                <button
                  type="button"
                  onClick={() => setTaskText(EXAMPLE)}
                  className="text-xs text-primary hover:underline"
                >
                  Use example tasks
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hours">Working hours</Label>
                  <Input
                    id="hours"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="09:00 - 17:00"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority">Default priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deadlines">Deadlines (optional)</Label>
                <Input
                  id="deadlines"
                  value={deadlines}
                  onChange={(e) => setDeadlines(e.target.value)}
                  placeholder="Quarterly report due Friday 16:00"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={submit} disabled={!taskText.trim() || action.loading}>
                  <CalendarClock className="size-4" />
                  {action.loading ? "Planning..." : "Generate schedule"}
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
            title="Your schedule"
            description="Track progress by updating each task status."
            actions={
              tasks.length ? (
                <>
                  <CopyButton value={copyText} />
                  <RegenerateButton onClick={submit} disabled={action.loading} />
                </>
              ) : null
            }
          >
            {action.loading ? (
              <LoadingState label="AI is building your schedule..." />
            ) : action.error ? (
              <ErrorState message={action.error} onRetry={action.retry} />
            ) : tasks.length ? (
              <div className="space-y-3">
                <ol className="relative space-y-3 border-l border-border pl-5">
                  {tasks.map((task) => (
                    <li key={task.id} className="relative">
                      <span className="absolute -left-[26px] top-4 size-2.5 rounded-full border-2 border-background bg-primary" />
                      <div className="rounded-xl border border-border bg-card p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{task.name}</p>
                            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="size-3.5" />
                                {task.start} · {task.duration}
                              </span>
                              {task.deadline ? <span>Due: {task.deadline}</span> : null}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <PriorityBadge priority={task.priority} />
                            <StatusBadge status={task.status} />
                          </div>
                        </div>
                        {task.note ? (
                          <p className="mt-2 text-xs text-muted-foreground">{task.note}</p>
                        ) : null}
                        <div className="mt-3">
                          <Select
                            value={task.status}
                            onValueChange={(v) => setTaskStatus(task.id, v as TaskStatus)}
                          >
                            <SelectTrigger className="h-8 w-44 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not-started">Not started</SelectItem>
                              <SelectItem value="in-progress">In progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
                {demo ? <DemoNotice /> : null}
              </div>
            ) : (
              <EmptyState
                title="No schedule yet"
                hint="Add your tasks and working hours, then generate a plan for the day."
              />
            )}
          </Panel>
        }
      />
    </div>
  );
}
