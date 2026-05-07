"use client";

import { useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
  onClose: () => void;
}

export function BottomSheet({ children, onClose }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [snap, setSnap] = useState<"partial" | "full">("partial");
  const [startY, setStartY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const snapHeights = { partial: "42%", full: "92%" };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setDragging(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragging) return;
    const delta = e.changedTouches[0].clientY - startY;
    if (delta > 60) {
      if (snap === "full") setSnap("partial");
      else onClose();
    } else if (delta < -60) {
      setSnap("full");
    }
    setDragging(false);
  };

  return (
    <>
      <div className="absolute inset-0 z-30" onClick={onClose} />
      <div
        ref={sheetRef}
        className="bottom-sheet absolute bottom-0 left-0 right-0 z-40 bg-grounds-cream rounded-t-2xl shadow-2xl overflow-hidden"
        style={{ height: snapHeights[snap] }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-grounds-brown/20 rounded-full" />
        </div>
        <div className="overflow-y-auto h-full pb-6">
          {children}
        </div>
      </div>
    </>
  );
}
