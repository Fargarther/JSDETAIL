"use client";

import { useEffect, useState } from "react";

export default function ScrollUpHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let prevY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < prevY - 2) {
        setVisible(false);
        cleanup();
      }
      prevY = y;
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "PageUp", "Home", "k"].includes(e.key)) {
        setVisible(false);
        cleanup();
      }
    };
    const timeout = window.setTimeout(() => {
      setVisible(false);
      cleanup();
    }, 8000);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey, { passive: true });

    const cleanup = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timeout);
    };

    return cleanup;
  }, []);

  if (!visible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-neutral-900/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-md"
    >
      ⬆ Scroll up to begin
    </div>
  );
}

