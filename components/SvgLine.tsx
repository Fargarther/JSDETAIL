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
  invert?: boolean;           // if true, progress increases when scrolling up
  unifiedTimeline?: boolean;  // if true, scrub a single timeline for all paths
  scrubSmoothing?: number;    // when scrub is true, smoothing amount (default 0.5)
  pin?: boolean;              // if true, pin during scrub to keep in view
  scrollMultiplier?: number;  // multiplier for viewport height when pinning (default 2)
  scrollDistancePx?: number;  // explicit scroll distance when pinning (overrides multiplier)
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
  const __opts = (arguments as IArguments)[0] as Props | undefined;
  const invert = __opts?.invert ?? false;
  const unifiedTimeline = __opts?.unifiedTimeline ?? false;
  const scrubSmoothing = __opts?.scrubSmoothing ?? 0.5;
  const pin = __opts?.pin ?? false;
  const scrollMultiplier = __opts?.scrollMultiplier ?? 2;
  const scrollDistancePx = __opts?.scrollDistancePx;

  useEffect(() => {
    let killed = false;
    const cleanup: Array<() => void> = [];

    (async () => {
      if (!wrapperRef.current) return;

      // Fetch + inline SVG
      const res = await fetch(src, { cache: "force-cache" });
      if (!res.ok) {
        console.warn("SvgLine: failed to fetch", src, res.status, res.statusText);
        return;
      }
      const svgText = await res.text();
      if (killed) return;

      wrapperRef.current.innerHTML = svgText;
      const svg = wrapperRef.current.querySelector("svg") as SVGSVGElement | null;
      if (!svg) {
        console.warn("SvgLine: no <svg> root found in", src);
        return;
      }

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
      if (!paths.length) { 
        console.warn("SvgLine: no <path> elements found in", src);
        setReady(true); 
        return; 
      }

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

      if (scrub && unifiedTimeline) {
        // Single timeline scrub: map scroll progress to a single TL covering all paths
        const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
        const ordered = [...infos].sort((a, b) => a.bboxTop - b.bboxTop);
        if (invert) ordered.reverse();
        const totalLen = ordered.reduce((acc, it) => acc + (it.len || 0), 0) || 1;
        for (const info of ordered) {
          const dur = info.len / totalLen; // proportional to length for constant draw rate
          tl.to(info.el, { strokeDashoffset: 0, duration: dur }, ">");
        }
        // Compute extended scroll distance when pinning
        const desiredDist = scrollDistancePx ?? Math.round(scrollMultiplier * (window.innerHeight || 800));
        const st = ScrollTrigger.create({
          trigger: svg,
          start: `top bottom`,
          end: pin ? `+=${desiredDist}` : `bottom top`,
          scrub: scrubSmoothing,
          pin: pin || undefined,
          anticipatePin: pin ? 1 : undefined,
          onEnter: () => {
            if (!once || tl.progress() === 0) tl.progress(0);
          },
          onEnterBack: () => {
            if (!once) tl.progress(0);
          },
          onUpdate: (self) => {
            const mapped = invert ? 1 - self.progress : self.progress;
            if (!once) {
              tl.progress(mapped);
            } else if (mapped > tl.progress()) {
              tl.progress(mapped);
            }
          },
        });
        cleanup.push(() => st.kill(), () => tl.kill());
      } else if (scrub) {
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
            start: `top bottom`,
            end: `bottom top`,
            scrub: scrubSmoothing,
            onEnter: () => {
              if (!once || tween.progress() === 0) {
                tween.progress(0);
              }
            },
            onEnterBack: () => {
              if (!once) {
                tween.progress(0);
              }
            },
            onUpdate: (self) => {
              const mapped = invert ? 1 - self.progress : self.progress;
              if (!once) {
                // Bidirectional when replay is allowed
                tween.progress(mapped);
              } else if (mapped > tween.progress()) {
                // Forward-only progress: never decrease tween progress
                tween.progress(mapped);
              }
            },
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

      // Refresh now that triggers are created, and again when the page settles at bottom
      try { 
        ScrollTrigger.refresh(true); 
      } catch {}
      const onBottomPositioned = () => {
        try { ScrollTrigger.refresh(true); } catch {}
      };
      window.addEventListener("bottom-positioned", onBottomPositioned);
      cleanup.push(() => window.removeEventListener("bottom-positioned", onBottomPositioned));

      setReady(true);
    })();

    return () => {
      killed = true;
      // run all cleanups
      for (const fn of cleanup.splice(0)) {
        try { fn(); } catch {}
      }
    };
  }, [src, nearTopPx, stroke, strokeWidth, decorative, scrub, once, groupByRowPx, invert, unifiedTimeline, scrubSmoothing]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden={decorative ? "true" : undefined}
      className="mx-auto flex justify-center items-center"
      data-ready={ready ? "true" : "false"}
    />
  );
}
