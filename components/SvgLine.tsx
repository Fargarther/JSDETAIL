"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;                // e.g. "/Images/Single_line_design.svg"
  nearTopPx?: number;         // trigger distance from viewport top (default 120)
  stroke?: string;            // default "currentColor"
  strokeWidth?: number;       // default 2.5
  decorative?: boolean;       // if true, aria-hidden
  scrub?: boolean;            // tie each path's draw to scroll while in view
  once?: boolean;             // play once and don't reverse (default true)
  groupByRowPx?: number;      // group paths whose bbox.y are within this px (optional)
};

type PathInfo = {
  el: SVGPathElement;
  len: number;
  bboxTop: number;
  groupKey?: number;
};

export default function SvgLine({
  src,
  nearTopPx = 120,
  stroke = "currentColor",
  strokeWidth = 2.5,
  decorative = true,
  scrub = false,
  once = true,
  groupByRowPx, // e.g., 8–20 to group horizontal segments
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let killed = false;
    const cleanup: Array<() => void> = [];

    (async () => {
      if (!wrapperRef.current) return;

      // Fetch + inline SVG
      const res = await fetch(src, { cache: "force-cache" });
      if (!res.ok) return;
      const svgText = await res.text();
      if (killed) return;

      wrapperRef.current.innerHTML = svgText;
      const svg = wrapperRef.current.querySelector("svg") as SVGSVGElement | null;
      if (!svg) return;

      svg.setAttribute("data-line-reveal", "");
      
      // Set natural responsive sizing
      svg.style.width = "100%";
      svg.style.height = "auto";
      svg.style.display = "block";
      
      if (decorative) {
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-hidden", "true");
      }

      const paths = Array.from(svg.querySelectorAll("path")) as SVGPathElement[];
      if (!paths.length) { setReady(true); return; }

      // Reduced motion: draw immediately
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Prepare paths WITHOUT flicker
      const infos: PathInfo[] = [];
      for (const p of paths) {
        const len = p.getTotalLength();
        // disable transition while setting the hidden state to avoid the brief hide-then-draw flash
        p.style.transition = "none";
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = String(len);
        p.style.fill = "none";
        p.style.stroke = stroke;
        p.style.strokeWidth = String(strokeWidth);
        (p.style as any).vectorEffect = "non-scaling-stroke";
        p.style.strokeLinecap = "round";
        p.style.strokeLinejoin = "round";
        infos.push({ el: p, len, bboxTop: 0 });
      }
      // Force reflow, then re-enable transitions (only actual draws will animate)
      svg.getBoundingClientRect();
      for (const p of paths) p.style.transition = "";

      if (reduced) {
        for (const p of paths) p.style.strokeDashoffset = "0";
        setReady(true);
        return;
      }

      // Compute bbox tops (in SVG local space); used for optional grouping
      for (const info of infos) {
        try {
          const bb = info.el.getBBox();
          info.bboxTop = bb.y;
        } catch {
          info.bboxTop = 0;
        }
      }

      // Optional grouping by approximate row (useful if one visual stroke is split)
      if (groupByRowPx && groupByRowPx > 0) {
        // Sort by bboxTop and bucket into groups
        infos.sort((a, b) => a.bboxTop - b.bboxTop);
        let groupId = 0;
        let currentStart = infos[0]?.bboxTop ?? 0;
        for (const info of infos) {
          if (Math.abs(info.bboxTop - currentStart) > groupByRowPx) {
            groupId++;
            currentStart = info.bboxTop;
          }
          info.groupKey = groupId;
        }
      }

      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      // Helper: make a trigger for a single element
      const makeTrigger = (el: Element, tweenFn: () => gsap.core.Tween | gsap.core.Timeline) => {
        const t = tweenFn();
        const st = ScrollTrigger.create({
          trigger: el,
          start: `top+=${nearTopPx} top`,
          once: !scrub && once,
          onEnter: () => {
            if (!scrub) t.play();
          },
          onEnterBack: () => {
            // Critical: Handle upward scrolling - fires when scrolling up
            if (!scrub) t.play();
          },
          onLeaveBack: () => {
            if (!scrub && !once) t.reverse();
          },
        });
        cleanup.push(() => st.kill(), () => t.kill());
        return { t, st };
      };

      if (scrub) {
        // Per-path scrub: the draw amount follows scroll while the path is in view
        for (const info of infos) {
          const { el, len } = info;
          const tween = gsap.to(el, {
            strokeDashoffset: 0,
            ease: "none",
            paused: true, // we'll drive progress from ScrollTrigger
          });
          const st = ScrollTrigger.create({
            trigger: el,
            start: `top+=${nearTopPx} top`,
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => tween.progress(self.progress),
          });
          cleanup.push(() => st.kill(), () => tween.kill());
        }
      } else if (groupByRowPx && groupByRowPx > 0) {
        // Grouped one-shots: all paths in the same visual row draw together when the first of them enters
        const groups = new Map<number, SVGPathElement[]>();
        for (const info of infos) {
          const k = info.groupKey ?? 0;
          if (!groups.has(k)) groups.set(k, []);
          groups.get(k)!.push(info.el);
        }
        Array.from(groups.values()).forEach(groupPaths => {
          // Use the path with the smallest top as trigger
          const triggerEl = groupPaths.reduce((min: SVGPathElement, el: SVGPathElement) => {
            const a = el.getBoundingClientRect?.()?.top ?? 0;
            const b = min.getBoundingClientRect?.()?.top ?? 0;
            return a < b ? el : min;
          }, groupPaths[0]);

          makeTrigger(triggerEl, () =>
            gsap.to(groupPaths, {
              strokeDashoffset: 0,
              stagger: 0.06, // small intra-group stagger
              duration: 1.1,
              ease: "power2.out",
              paused: true,
            })
          );
        });
      } else {
        // Simple per-path one-shot: each path draws when its own top nears the viewport top
        for (const info of infos) {
          const { el } = info;
          makeTrigger(el, () =>
            gsap.to(el, {
              strokeDashoffset: 0,
              duration: 1.1,
              ease: "power2.out",
              paused: true,
            })
          );
        }
      }

      // Refresh after layout and initial scroll positioning
      const delayedRefresh = () => {
        setTimeout(() => {
          try { 
            ScrollTrigger.refresh(true); // force recalculation
          } catch {}
        }, 600); // Wait for useStartAtBottom to complete
      };

      requestAnimationFrame(() => {
        delayedRefresh();
      });

      setReady(true);
    })();

    return () => {
      killed = true;
      // run all cleanups
      for (const fn of cleanup.splice(0)) {
        try { fn(); } catch {}
      }
    };
  }, [src, nearTopPx, stroke, strokeWidth, decorative, scrub, once, groupByRowPx]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden={decorative ? "true" : undefined}
      className="mx-auto flex justify-center items-center"
      data-ready={ready ? "true" : "false"}
    />
  );
}