import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShieldCheck } from "lucide-react";
import logo from "@/assets/workmate-logo.png";
import { navItems } from "./nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img
        src={logo}
        alt="FlowMate AI logo"
        width={32}
        height={32}
        className="size-8 rounded-lg"
      />
      <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
        FlowMate <span className="text-primary">AI</span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navItems.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className={cn("size-4.5 shrink-0", active && "text-primary")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const { settings } = useAppStore();
  const initials = settings.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="space-y-3 border-t border-sidebar-border p-3">
      <Link
        to="/settings"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent/60"
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary-soft text-xs font-semibold text-primary">
            {initials || "PR"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{settings.name}</p>
          <p className="truncate text-xs text-muted-foreground">{settings.email}</p>
        </div>
      </Link>
      <Link
        to="/settings"
        hash="privacy"
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        <ShieldCheck className="size-4" />
        Responsible AI &amp; Privacy
      </Link>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar shadow-card lg:flex">
        <div className="px-5 py-5">
          <Brand />
        </div>
        <NavList />
        <SidebarFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/85 px-4 py-3 backdrop-blur sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="px-5 py-5">
                <Brand />
              </div>
              <NavList onNavigate={() => setOpen(false)} />
              <SidebarFooter onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="lg:hidden">
            <Brand />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              AI-powered workplace productivity
            </span>
            <Link to="/settings">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  PR
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>

        <footer className="border-t border-border px-4 py-4 text-center text-[11px] leading-relaxed text-muted-foreground sm:px-6">
          FlowMate AI · AI-generated content may contain errors. Verify outputs before using them
          for important business decisions and avoid entering confidential information.
        </footer>
      </div>
    </div>
  );
}
