"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

export default function RevealTop({
  children,
  className = "",
  thresholdTopPx = 120,
  once = true,
  duration = 0.5,
}: {
  children: ReactNode;
  className?: string;
  thresholdTopPx?: number; // distance from viewport top to trigger
  once?: boolean;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const reduced = typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      // Immediately show
      ref.current.style.opacity = "1";
      ref.current.style.transform = "none";
      return;
    }

    // Dynamic import GSAP client-side
    let ctx: { revert: () => void } | null = null;
    let removeListener: (() => void) | null = null;
    const initAnimation = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      // Set initial hidden state immediately to avoid flash
      if (ref.current) {
        ref.current.style.opacity = "0";
        ref.current.style.transform = "translateY(-16px)";
      }

      ctx = gsap.context(() => {
        gsap.to(ref.current, {
          opacity: 1,
          y: 0,
          duration,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current!,
            start: `top+=${thresholdTopPx} top`,
            toggleActions: once ? "play none none none" : "play none none reverse",
            once,
            refreshPriority: -1, // Lower priority to ensure proper calculation order
          },
        });
      }, ref);

      // Refresh when the page reports it has settled at the bottom
      const onBottomPositioned = () => {
        try { ScrollTrigger.refresh(); } catch {}
      };
      window.addEventListener("bottom-positioned", onBottomPositioned);
      removeListener = () => window.removeEventListener("bottom-positioned", onBottomPositioned);
    };

    initAnimation();

    return () => {
      ctx?.revert?.();
      removeListener?.();
    };
  }, [thresholdTopPx, once, duration]);

  const baseStyle: CSSProperties = { willChange: "opacity, transform" };

  return (
    <div ref={ref} className={className} style={baseStyle}>
      {children}
    </div>
  );
}
