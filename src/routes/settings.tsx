import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeading, Panel, ResponsibleAIBanner } from "@/components/ai/AiPanels";
import type { EmailTone, Priority, ResponseLength } from "@/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — FlowMate AI" },
      {
        name: "description",
        content:
          "Manage your FlowMate AI profile, default email tone, task priority, theme, AI response length and privacy guidance.",
      },
      { property: "og:title", content: "Settings — FlowMate AI" },
      {
        property: "og:description",
        content: "Profile, preferences, AI settings and responsible AI guidance.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, updateSettings } = useAppStore();
  const initials = settings.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeading
        title="Settings"
        description="Personalise FlowMate AI and review how to use it responsibly."
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Panel title="Profile" description="Shown across the assistant.">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="bg-primary-soft text-base font-semibold text-primary">
                  {initials || "PR"}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground">
                Your initials are used as your profile avatar.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => updateSettings({ name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => updateSettings({ email: e.target.value })}
              />
            </div>
            <Button size="sm" onClick={() => toast.success("Profile saved")}>
              Save profile
            </Button>
          </div>
        </Panel>

        <Panel title="Preferences" description="Defaults applied to new AI requests.">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tone">Default email tone</Label>
              <Select
                value={settings.defaultTone}
                onValueChange={(v) => updateSettings({ defaultTone: v as EmailTone })}
              >
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
            <div className="space-y-1.5">
              <Label htmlFor="prio">Default task priority</Label>
              <Select
                value={settings.defaultPriority}
                onValueChange={(v) => updateSettings({ defaultPriority: v as Priority })}
              >
                <SelectTrigger id="prio">
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
              <Label htmlFor="theme">Theme preference</Label>
              <Select
                value={settings.theme}
                onValueChange={(v) => updateSettings({ theme: v as "light" | "dark" })}
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Panel>

        <Panel title="AI preferences" description="How detailed AI responses should be.">
          <div className="space-y-1.5">
            <Label htmlFor="len">AI response length</Label>
            <Select
              value={settings.responseLength}
              onValueChange={(v) => updateSettings({ responseLength: v as ResponseLength })}
            >
              <SelectTrigger id="len">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Panel>

        <div id="privacy" className="scroll-mt-24">
          <Panel title="Privacy & responsible AI" description="Please read before using AI tools.">
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Avoid entering confidential, sensitive or personal information into AI prompts
                  unless your organization&apos;s approved AI system explicitly permits it. Treat
                  anything you type as data leaving your immediate workspace.
                </p>
              </div>
              <ResponsibleAIBanner />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
