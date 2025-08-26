"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;                // e.g. "/Images/Single_line_design.svg"
  nearTopPx?: number;         // trigger distance from top (default 120)
  staggerMs?: number;         // per-path stagger
  stroke?: string;            // default "currentColor"
  strokeWidth?: number;       // default 2.5
  decorative?: boolean;       // if true, aria-hidden
  scrub?: boolean;            // if true, tie draw to scroll
};

export default function SvgLine({
  src,
  nearTopPx = 120,
  staggerMs = 60,
  stroke = "currentColor",
  strokeWidth = 2.5,
  decorative = true,
  scrub = false,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cleanupFns: Array<() => void> = [];
    let killed = false;

    (async () => {
      if (!wrapperRef.current) return;

      // fetch + inline SVG
      const res = await fetch(src, { cache: "force-cache" });
      if (!res.ok) return;
      const svgText = await res.text();
      if (killed) return;

      wrapperRef.current.innerHTML = svgText;
      const svg = wrapperRef.current.querySelector("svg");
      if (!svg) return;
      svg.setAttribute("data-line-reveal", "");
      
      // Set responsive sizing constraints
      svg.style.width = "100%";
      svg.style.height = "auto";
      svg.style.maxWidth = "7200px";
      svg.style.maxHeight = "540vh";
      svg.style.display = "block";
      
      if (decorative) {
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-hidden", "true");
      }

      // style paths
      const paths = Array.from(svg.querySelectorAll("path"));
      // reduced motion?
      const reduced = typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Prepare SVG paths for drawing effect (prevent flicker)
      const pathElements: SVGPathElement[] = [];
      for (const p of paths) {
        const pathEl = p as SVGPathElement;
        const L = pathEl.getTotalLength();
        (pathEl as any).__len = L;
        
        // Disable all transitions initially to prevent flash
        pathEl.style.transition = "none";
        pathEl.style.strokeDasharray = String(L);
        pathEl.style.strokeDashoffset = String(L);
        pathEl.style.fill = "none";
        pathEl.style.stroke = stroke;
        pathEl.style.strokeWidth = String(strokeWidth);
        pathEl.style.vectorEffect = "non-scaling-stroke";
        pathEl.style.strokeLinecap = "round";
        pathEl.style.strokeLinejoin = "round";
        
        pathElements.push(pathEl);
      }
      
      // Force reflow to apply initial styles
      svg.getBoundingClientRect();
      
      // Re-enable smooth transitions for animation
      for (const pathEl of pathElements) {
        pathEl.style.transition = "stroke-dashoffset 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      }

      if (reduced) {
        for (const p of paths) (p as SVGPathElement).style.strokeDashoffset = "0";
        setLoaded(true);
        return;
      }

      // Animate with GSAP
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      // Create drawing animation timeline
      let tl = gsap.timeline({
        paused: true,
        defaults: { 
          ease: "none", // Use linear for consistent drawing speed
          duration: 3, // Longer duration for more dramatic effect
        },
      });

      // If scrub mode - tie drawing to scroll progress
      if (scrub) {
        tl.to(pathElements, {
          strokeDashoffset: 0,
          duration: 1,
          stagger: {
            each: 0.2, // Delay between each path starting
            ease: "power2.inOut"
          }
        });

        const st = ScrollTrigger.create({
          trigger: svg,
          start: `top+=${nearTopPx} top`,
          end: "bottom center", // Longer scroll distance for smoother scrub
          scrub: 1.5, // Smooth scrubbing with slight lag
          onUpdate: (self) => tl.progress(self.progress),
        });

        cleanupFns.push(() => st.kill());
      } else {
        // Classic staggered drawing effect
        tl.to(pathElements, {
          strokeDashoffset: 0,
          duration: 2.5, // Individual path drawing time
          stagger: {
            each: staggerMs / 1000,
            ease: "power1.inOut"
          },
          ease: "power1.inOut" // Smooth drawing motion
        });

        // Trigger when SVG comes into view from bottom (bottom-up design)
        const st = ScrollTrigger.create({
          trigger: svg,
          start: `top+=${nearTopPx} top`,
          once: true,
          onEnter: () => {
            tl.play();
          },
        });

        cleanupFns.push(() => st.kill());
      }

      cleanupFns.push(() => {
        // Kill timeline
        // @ts-ignore
        tl?.kill?.();
      });

      setLoaded(true);
    })();

    return () => {
      killed = true;
      for (const fn of cleanupFns.splice(0)) {
        try { 
          fn(); 
        } catch {}
      }
    };
  }, [src, nearTopPx, staggerMs, stroke, strokeWidth, decorative, scrub]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden={decorative ? "true" : undefined}
      className="mx-auto flex justify-center items-center"
      data-loaded={loaded ? "true" : "false"}
    />
  );
}