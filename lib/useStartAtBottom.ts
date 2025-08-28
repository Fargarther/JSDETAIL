"use client";

import { useEffect } from "react";

export function useStartAtBottom() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if ("scrollRestoration" in history) {
      try { 
        history.scrollRestoration = "manual"; 
      } catch {}
    }

    // Don't override back/forward nav or hash links
    const navType = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type;
    if (navType === "back_forward" || location.hash) return;

    let rafId = 0;
    let aborted = false;
    const startTs = Date.now();
    const deadlineMs = 2000; // fail-safe max settling time
    let lastHeight = 0;
    let lastHeightChangeTs = Date.now();

    const atBottom = () => {
      const doc = document.documentElement;
      const scrollY = window.scrollY || window.pageYOffset;
      const visible = window.innerHeight || doc.clientHeight;
      const total = Math.max(doc.scrollHeight, doc.offsetHeight, doc.clientHeight);
      return scrollY + visible >= total - 1; // allow 1px tolerance
    };

    const scrollToBottom = () => {
      const doc = document.documentElement;
      const total = Math.max(doc.scrollHeight, doc.offsetHeight, doc.clientHeight);
      window.scrollTo({ top: total });
    };

    const onUserScroll = () => {
      // If the user actively scrolls, stop forcing position.
      // We only care about initial load positioning.
      aborted = true;
    };
    window.addEventListener("wheel", onUserScroll, { passive: true });
    window.addEventListener("touchstart", onUserScroll, { passive: true });
    window.addEventListener("keydown", onUserScroll, { passive: true });

    const settle = () => {
      if (aborted) return done();

      const doc = document.documentElement;
      const total = Math.max(doc.scrollHeight, doc.offsetHeight, doc.clientHeight);
      if (total !== lastHeight) {
        lastHeight = total;
        lastHeightChangeTs = Date.now();
      }

      if (!atBottom()) {
        scrollToBottom();
      }

      const timeSinceHeightChange = Date.now() - lastHeightChangeTs;
      const timedOut = Date.now() - startTs > deadlineMs;
      if (atBottom() && (timeSinceHeightChange > 200 || timedOut)) {
        return done();
      }
      rafId = window.requestAnimationFrame(settle);
    };

    const done = async () => {
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchstart", onUserScroll);
      window.removeEventListener("keydown", onUserScroll);
      if (rafId) cancelAnimationFrame(rafId);
      try {
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        // Trigger a final refresh now that we're settled at bottom
        ScrollTrigger.refresh(true);
      } catch {}
      try {
        // Notify components waiting to refresh without relying on magic delays
        window.dispatchEvent(new Event("bottom-positioned"));
      } catch {}
    };

    // Begin initial positioning on next frame
    rafId = window.requestAnimationFrame(() => {
      scrollToBottom();
      settle();
    });

    return () => {
      aborted = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchstart", onUserScroll);
      window.removeEventListener("keydown", onUserScroll);
    };
  }, []);
}
