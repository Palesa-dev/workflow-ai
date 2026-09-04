import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { EmailTone, PlannedTask, Priority, ResponseLength, TaskStatus } from "@/types";

export type Settings = {
  name: string;
  email: string;
  defaultTone: EmailTone;
  defaultPriority: Priority;
  responseLength: ResponseLength;
  theme: "light" | "dark";
};

type Stats = { emailsGenerated: number; meetingsSummarized: number };

type StoreValue = {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  stats: Stats;
  bump: (key: keyof Stats) => void;
  tasks: PlannedTask[];
  setTasks: (tasks: PlannedTask[]) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  tasksCompleted: number;
  tasksRemaining: number;
};

const DEFAULT_SETTINGS: Settings = {
  name: "Palesa Ramkgopa",
  email: "alex.morgan@company.com",
  defaultTone: "professional",
  defaultPriority: "medium",
  responseLength: "medium",
  theme: "light",
};

const StoreContext = createContext<StoreValue | null>(null);
const KEY = "workmate-ai-state";

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<Stats>({ emailsGenerated: 0, meetingsSummarized: 0 });
  const [tasks, setTasksState] = useState<PlannedTask[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<{
          settings: Settings;
          stats: Stats;
          tasks: PlannedTask[];
        }>;
        if (parsed.settings) setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
        if (parsed.stats) setStats(parsed.stats);
        if (parsed.tasks) setTasksState(parsed.tasks);
      }
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ settings, stats, tasks }));
  }, [settings, stats, tasks, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme, hydrated]);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })),
    [],
  );
  const bump = useCallback(
    (key: keyof Stats) => setStats((s) => ({ ...s, [key]: s[key] + 1 })),
    [],
  );
  const setTasks = useCallback((next: PlannedTask[]) => setTasksState(next), []);
  const setTaskStatus = useCallback(
    (id: string, status: TaskStatus) =>
      setTasksState((list) => list.map((t) => (t.id === id ? { ...t, status } : t))),
    [],
  );

  const value = useMemo<StoreValue>(
    () => ({
      settings,
      updateSettings,
      stats,
      bump,
      tasks,
      setTasks,
      setTaskStatus,
      tasksCompleted: tasks.filter((t) => t.status === "completed").length,
      tasksRemaining: tasks.filter((t) => t.status !== "completed").length,
    }),
    [settings, updateSettings, stats, bump, tasks, setTasks, setTaskStatus],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
