import { useState, useCallback, useEffect } from "react";

type MapApp = "apple" | "google";
const STORAGE_KEY = "grounds_map_preference";

export function useMapPreference() {
  const [preference, setPreferenceState] = useState<MapApp | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "apple" || stored === "google") {
        setPreferenceState(stored);
      }
    } catch {}
  }, []);

  const setPreference = useCallback((app: MapApp) => {
    setPreferenceState(app);
    try {
      localStorage.setItem(STORAGE_KEY, app);
    } catch {}
  }, []);

  const clearPreference = useCallback(() => {
    setPreferenceState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return { preference, setPreference, clearPreference };
}
