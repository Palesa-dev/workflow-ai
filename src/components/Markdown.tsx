import { Fragment } from "react";

/** Minimal, dependency-free markdown renderer for AI output. */
function inline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={key} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2)
      return (
        <em key={key} className="text-muted-foreground">
          {part.slice(1, -1)}
        </em>
      );
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={key} className="rounded bg-muted px-1.5 py-0.5 text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    return <Fragment key={key}>{part}</Fragment>;
  });
}

export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/```/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let ordered = false;

  const flush = (key: string) => {
    if (!list.length) return;
    const items = list.map((item, i) => (
      <li key={`${key}-${i}`} className="leading-relaxed">
        {inline(item, `${key}-${i}`)}
      </li>
    ));
    blocks.push(
      ordered ? (
        <ol key={key} className="ml-5 list-decimal space-y-1.5 text-sm text-foreground/90">
          {items}
        </ol>
      ) : (
        <ul key={key} className="ml-5 list-disc space-y-1.5 text-sm text-foreground/90">
          {items}
        </ul>
      ),
    );
    list = [];
  };

  lines.forEach((raw, index) => {
    const line = raw.trimEnd();
    const key = `b-${index}`;
    if (!line.trim()) {
      flush(`l-${index}`);
      return;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      flush(`l-${index}`);
      const level = heading[1]!.length;
      blocks.push(
        <h3
          key={key}
          className={
            level <= 2
              ? "mt-5 text-sm font-semibold uppercase tracking-wide text-primary first:mt-0"
              : "mt-4 text-base font-semibold text-foreground first:mt-0"
          }
        >
          {inline(heading[2]!, key)}
        </h3>,
      );
      return;
    }
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    const num = /^\d+[.)]\s+(.*)$/.exec(line);
    if (bullet || num) {
      const wasOrdered = ordered;
      ordered = Boolean(num);
      if (list.length && wasOrdered !== ordered) flush(`l-${index}`);
      list.push((bullet?.[1] ?? num?.[1])!);
      return;
    }
    flush(`l-${index}`);
    blocks.push(
      <p key={key} className="text-sm leading-relaxed text-foreground/90">
        {inline(line, key)}
      </p>,
    );
  });
  flush("l-final");

  return <div className="space-y-3">{blocks}</div>;
}
