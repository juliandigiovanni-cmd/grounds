import { useState, useCallback } from "react";

export type SnapPosition = "closed" | "partial" | "full";

export function useBottomSheet(initial: SnapPosition = "closed") {
  const [snap, setSnap] = useState<SnapPosition>(initial);

  const open = useCallback(() => setSnap("partial"), []);
  const expand = useCallback(() => setSnap("full"), []);
  const close = useCallback(() => setSnap("closed"), []);

  const handleDrag = useCallback(
    (deltaY: number) => {
      if (deltaY > 60) {
        if (snap === "full") setSnap("partial");
        else setSnap("closed");
      } else if (deltaY < -60) {
        if (snap === "partial") setSnap("full");
      }
    },
    [snap]
  );

  const snapHeights: Record<SnapPosition, string> = {
    closed: "0%",
    partial: "42%",
    full: "92%",
  };

  return { snap, snapHeight: snapHeights[snap], open, expand, close, handleDrag };
}
