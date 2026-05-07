import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "grounds_saved_cafes";

export function useSavedCafes() {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSaved(JSON.parse(stored));
    } catch {}
  }, []);

  const save = useCallback((cafeId: string) => {
    setSaved(prev => {
      const next = prev.includes(cafeId) ? prev : [...prev, cafeId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const unsave = useCallback((cafeId: string) => {
    setSaved(prev => {
      const next = prev.filter(id => id !== cafeId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggle = useCallback((cafeId: string) => {
    setSaved(prev => {
      const next = prev.includes(cafeId) ? prev.filter(id => id !== cafeId) : [...prev, cafeId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isSaved = useCallback((cafeId: string) => saved.includes(cafeId), [saved]);

  return { saved, save, unsave, toggle, isSaved };
}
