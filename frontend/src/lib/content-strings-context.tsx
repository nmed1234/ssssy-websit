"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { getPublicContentStrings } from "./content-strings";
import { useLanguage } from "./language-context";

interface ContentStringsContextValue {
  strings: Record<string, string>;
  loading: boolean;
  error: string | null;
  t: (key: string, fallback?: string) => string;
  refresh: () => Promise<void>;
}

const ContentStringsContext = createContext<ContentStringsContextValue>({
  strings: {},
  loading: true,
  error: null,
  t: (key: string, fallback?: string) => fallback || key,
  refresh: async () => {},
});

export function ContentStringsProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [strings, setStrings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchStrings = useCallback(async (lang: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await getPublicContentStrings(lang);
      if (!controller.signal.aborted) {
        setStrings(res.data.data || {});
        setLoading(false);
      }
    } catch (err: unknown) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : "Failed to load content strings");
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchStrings(language);
  }, [language, fetchStrings]);

  const t = useCallback(
    (key: string, fallback?: string) => {
      return strings[key] ?? fallback ?? key;
    },
    [strings]
  );

  const refresh = useCallback(async () => {
    await fetchStrings(language);
  }, [language, fetchStrings]);

  return (
    <ContentStringsContext.Provider value={{ strings, loading, error, t, refresh }}>
      {children}
    </ContentStringsContext.Provider>
  );
}

export function useContentStrings() {
  const ctx = useContext(ContentStringsContext);
  if (!ctx) {
    throw new Error("useContentStrings must be used within ContentStringsProvider");
  }
  return ctx;
}
