import { useState } from "react";
import { Check, Copy, Loader2, RefreshCw, Sparkle, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/Markdown";
import { cn } from "@/lib/utils";

export function WorkspaceLayout({
  input,
  output,
}: {
  input: React.ReactNode;
  output: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="min-w-0">{input}</div>
      <div className="min-w-0 lg:sticky lg:top-6">{output}</div>
    </div>
  );
}

export function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1 border-l-3 border-l-primary pl-3">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card p-5 sm:p-6", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 1800);
        } catch {
          toast.error("Could not copy to clipboard");
        }
      }}
    >
      {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      {copied ? "Copied" : label}
    </Button>
  );
}

export function RegenerateButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} disabled={disabled}>
      <RefreshCw className="size-4" />
      Regenerate
    </Button>
  );
}

export function LoadingState({ label = "AI is thinking..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-pulse rounded-full bg-primary/60"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Sparkle className="size-5" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive-soft p-5">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Something went wrong</p>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AiOutput({ content }: { content: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/25 p-5">
      <Markdown content={content} />
    </div>
  );
}

export function ResponsibleAIBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning-soft/60 px-3.5 py-2.5",
        compact ? "text-[11px]" : "text-xs",
      )}
    >
      <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" />
      <p className="leading-relaxed text-muted-foreground">
        AI-generated content may contain errors or inaccuracies. Review and verify AI outputs before
        using them for important business decisions. Do not enter confidential or sensitive
        information unless your organization&apos;s AI policy allows it.
      </p>
    </div>
  );
}

export function DemoNotice() {
  return (
    <p className="text-[11px] text-muted-foreground">
      Demo response generated without a live AI connection.
    </p>
  );
}
