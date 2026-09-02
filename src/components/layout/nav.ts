import {
  Bot,
  CalendarClock,
  LayoutDashboard,
  Mail,
  NotebookPen,
  Search,
  Settings,
} from "lucide-react";

export const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email-generator", label: "Email Generator", icon: Mail },
  { to: "/meeting-summarizer", label: "Meeting Summarizer", icon: NotebookPen },
  { to: "/task-planner", label: "Task Planner", icon: CalendarClock },
  { to: "/research-assistant", label: "Research Assistant", icon: Search },
  { to: "/ai-chat", label: "AI Chat", icon: Bot },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;
