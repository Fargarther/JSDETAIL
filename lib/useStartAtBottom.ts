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

    const scrollToBottom = () => window.scrollTo({ 
      top: document.documentElement.scrollHeight 
    });

    requestAnimationFrame(() => {
      scrollToBottom();
      setTimeout(scrollToBottom, 50);
      setTimeout(scrollToBottom, 250);
    });
  }, []);
}