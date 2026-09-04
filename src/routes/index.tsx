import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  ListTodo,
  Mail,
  NotebookPen,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsibleAIBanner } from "@/components/ai/AiPanels";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — WorkMate AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Your AI-powered workplace productivity dashboard: generate emails, summarize meetings, plan tasks, research topics and chat with WorkMate AI.",
      },
      { property: "og:title", content: "Dashboard — WorkMate AI Workplace Assistant" },
      {
        property: "og:description",
        content: "AI tools for emails, meeting notes, task planning, research and workplace chat.",
      },
    ],
  }),
  component: Dashboard,
});

const features = [
  {
    to: "/email-generator" as const,
    icon: Mail,
    name: "Smart Email Generator",
    description: "Draft polished, on-tone business emails in seconds.",
    color: "bg-sky-soft text-sky",
    accent: "border-t-sky",
  },
  {
    to: "/meeting-summarizer" as const,
    icon: NotebookPen,
    name: "Meeting Notes Summarizer",
    description: "Turn raw notes into decisions, action items and deadlines.",
    color: "bg-teal-soft text-teal",
    accent: "border-t-teal",
  },
  {
    to: "/task-planner" as const,
    icon: CalendarClock,
    name: "AI Task Planner",
    description: "Build a realistic daily schedule around your priorities.",
    color: "bg-amber-soft text-amber",
    accent: "border-t-amber",
  },
  {
    to: "/research-assistant" as const,
    icon: Search,
    name: "AI Research Assistant",
    description: "Structured briefings on any workplace topic or question.",
    color: "bg-coral-soft text-coral",
    accent: "border-t-coral",
  },
  {
    to: "/ai-chat" as const,
    icon: Bot,
    name: "AI Workplace Chat",
    description: "Ask anything about your work and keep the conversation going.",
    color: "bg-primary-soft text-primary",
    accent: "border-t-primary",
  },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { stats, tasksCompleted, tasksRemaining, settings } = useAppStore();

  const overview = [
    { label: "Tasks completed", value: tasksCompleted, icon: CheckCircle2, tint: "bg-success-soft text-success" },
    { label: "Tasks remaining", value: tasksRemaining, icon: ListTodo, tint: "bg-amber-soft text-amber" },
    { label: "Emails generated", value: stats.emailsGenerated, icon: Mail, tint: "bg-sky-soft text-sky" },
    {
      label: "Meetings summarized",
      value: stats.meetingsSummarized,
      icon: NotebookPen,
      tint: "bg-teal-soft text-teal",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="surface-card relative flex flex-col gap-4 overflow-hidden border-l-4 border-l-primary p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-medium text-primary">
            <Sparkles className="size-3" /> WorkMate AI
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {greeting()}, {settings.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your AI-powered workplace productivity assistant.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/email-generator">Generate Email</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/meeting-summarizer">Summarize Notes</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/task-planner">Plan My Day</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/ai-chat">Ask AI</Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Productivity overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overview.map((stat) => (
            <div key={stat.label} className="surface-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <span className={`flex size-8 items-center justify-center rounded-lg ${stat.tint}`}>
                  <stat.icon className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          AI tools
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.to}
              className={`surface-card flex flex-col border-t-2 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift ${feature.accent}`}
            >
              <div className={`flex size-10 items-center justify-center rounded-lg ${feature.color}`}>
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{feature.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{feature.description}</p>
              <Button asChild variant="outline" size="sm" className="mt-4 self-start">
                <Link to={feature.to}>
                  Open <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <ResponsibleAIBanner />
    </div>
  );
}
