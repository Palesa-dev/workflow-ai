import { useCallback, useState } from "react";

type Result = { text: string; demo: boolean };

/** Shared loading / error / result state for any AI call. */
export function useAiAction<TArgs>(fn: (args: TArgs) => Promise<Result>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [lastArgs, setLastArgs] = useState<TArgs | null>(null);

  const run = useCallback(
    async (args: TArgs) => {
      setLastArgs(args);
      setLoading(true);
      setError(null);
      try {
        const res = await fn(args);
        setResult(res);
        return res;
      } catch (e) {
        setResult(null);
        setError(e instanceof Error ? e.message : "The AI request failed. Please try again.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fn],
  );

  const retry = useCallback(() => {
    if (lastArgs !== null) void run(lastArgs);
  }, [lastArgs, run]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLastArgs(null);
  }, []);

  return { loading, error, result, run, retry, reset, canRetry: lastArgs !== null };
}
