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

    const refreshScrollTrigger = async () => {
      try {
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        ScrollTrigger.refresh();
      } catch {}
    };

    requestAnimationFrame(() => {
      scrollToBottom();
      setTimeout(() => {
        scrollToBottom();
        refreshScrollTrigger();
      }, 100);
      setTimeout(() => {
        scrollToBottom();
        refreshScrollTrigger();
      }, 500);
    });
  }, []);
}