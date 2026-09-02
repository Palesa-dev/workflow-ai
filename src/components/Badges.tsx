import type { Priority, TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

const priorityStyles: Record<Priority, string> = {
  high: "bg-destructive-soft text-destructive border-destructive/25",
  medium: "bg-warning-soft text-warning-foreground border-warning/30",
  low: "bg-success-soft text-success border-success/25",
};

const statusStyles: Record<TaskStatus, string> = {
  "not-started": "bg-muted text-muted-foreground border-border",
  "in-progress": "bg-primary-soft text-primary border-primary/25",
  completed: "bg-success-soft text-success border-success/25",
};

const statusLabels: Record<TaskStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
};

const base =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize";

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={cn(base, priorityStyles[priority])}>{priority} priority</span>;
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={cn(base, statusStyles[status])}>{statusLabels[status]}</span>;
}
