"use client";

import { CSSProperties, useEffect, useMemo, useRef } from "react";
import styles from "./FlavorWordsOverlay.module.css";

export type PositionedWord = {
  text: string;
  style: CSSProperties;
  weight?: number;
};

type WordInput = string | PositionedWord;

export type FlavorWordsOverlayProps = {
  words: WordInput[];
  radius?: number;
  hideOnCoarse?: boolean;
  className?: string;
  active?: boolean;
};

type NormalizedWord = {
  text: string;
  style: CSSProperties;
  weight: number;
};

const DEFAULT_WEIGHT = 0.85;
const PRESET_POSITIONS: Array<Omit<PositionedWord, "text">> = [
  { style: { top: "12%", left: "14%" }, weight: 1.2 },
  { style: { top: "28%", right: "16%" }, weight: 0.55 },
  { style: { bottom: "24%", left: "18%" }, weight: 0.9 },
  { style: { bottom: "14%", right: "14%" }, weight: 1.35 },
  { style: { top: "58%", right: "12%" }, weight: 0.45 },
];
const MAX_PRESET_COUNT = PRESET_POSITIONS.length;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

const normalizeWords = (input: WordInput[]): NormalizedWord[] => {
  if (!input.length) {
    return [];
  }

  const normalized: NormalizedWord[] = [];
  let presetIndex = 0;

  for (const entry of input) {
    if (typeof entry === "string") {
      if (presetIndex >= MAX_PRESET_COUNT) {
        break;
      }
      const preset = PRESET_POSITIONS[presetIndex];
      normalized.push({
        text: entry,
        style: { ...preset.style },
        weight: preset.weight ?? DEFAULT_WEIGHT,
      });
      presetIndex += 1;
    } else {
      normalized.push({
        text: entry.text,
        style: { ...entry.style },
        weight: entry.weight ?? DEFAULT_WEIGHT,
      });
    }
  }

  return normalized;
};

export default function FlavorWordsOverlay({
  words,
  radius,
  hideOnCoarse = true,
  className,
  active = true,
}: FlavorWordsOverlayProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const normalizedWords = useMemo(() => normalizeWords(words), [words]);

  useEffect(() => {
    const overlay = overlayRef.current;

    if (!overlay || typeof window === "undefined") {
      return;
    }

    let frame = 0;
    let pointerCaptured = false;
    let prefersReducedMotion = false;
    const pointer = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    const bounds = { left: 0, top: 0, width: 0, height: 0 };
    const viewport = {
      width: window.innerWidth || 1,
      height: window.innerHeight || 1,
    };

    const updateBounds = () => {
      const rect = overlay.getBoundingClientRect();
      bounds.left = rect.left;
      bounds.top = rect.top;
      bounds.width = rect.width;
      bounds.height = rect.height;
    };

    const updateViewport = () => {
      viewport.width = window.innerWidth || 1;
      viewport.height = window.innerHeight || 1;
    };

    const parkReveal = () => {
      pointerCaptured = false;
      if (prefersReducedMotion) {
        return;
      }
      overlay.style.setProperty("--mx", "-999px");
      overlay.style.setProperty("--my", "-999px");
      overlay.style.setProperty("--dx", "0");
      overlay.style.setProperty("--dy", "0");
    };

    const applyFrame = () => {
      frame = 0;
      if (!pointerCaptured || prefersReducedMotion) {
        return;
      }

      const relativeX = pointer.x - bounds.left;
      const relativeY = pointer.y - bounds.top;

      const clampedX = clamp(relativeX, 0, bounds.width);
      const clampedY = clamp(relativeY, 0, bounds.height);

      overlay.style.setProperty("--mx", `${clampedX}px`);
      overlay.style.setProperty("--my", `${clampedY}px`);

      const normalizedX = clamp((pointer.x / viewport.width) * 2 - 1, -1, 1);
      const normalizedY = clamp((pointer.y / viewport.height) * 2 - 1, -1, 1);

      overlay.style.setProperty("--dx", normalizedX.toFixed(4));
      overlay.style.setProperty("--dy", normalizedY.toFixed(4));
    };

    const scheduleFrame = () => {
      if (prefersReducedMotion || frame) {
        return;
      }
      frame = window.requestAnimationFrame(applyFrame);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerCaptured = true;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      scheduleFrame();
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) {
        parkReveal();
      }
    };

    const handleScroll = () => {
      updateBounds();
      if (pointerCaptured && !prefersReducedMotion) {
        scheduleFrame();
      }
    };

    updateBounds();
    updateViewport();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            updateBounds();
            if (pointerCaptured && !prefersReducedMotion) {
              scheduleFrame();
            }
          })
        : null;

    if (resizeObserver) {
      resizeObserver.observe(overlay);
    } else {
      window.addEventListener("resize", updateBounds);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updateViewport);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotionPreference = () => {
      prefersReducedMotion = motionQuery.matches;
      overlay.setAttribute(
        "data-motion",
        prefersReducedMotion ? "reduced" : "active"
      );
      if (prefersReducedMotion) {
        updateBounds();
        overlay.style.setProperty("--mx", `${bounds.width / 2}px`);
        overlay.style.setProperty("--my", `${bounds.height / 2}px`);
        overlay.style.setProperty("--dx", "0");
        overlay.style.setProperty("--dy", "0");
        pointerCaptured = false;
      } else {
        parkReveal();
      }
    };

    const handleMotionChange = () => {
      applyMotionPreference();
    };

    applyMotionPreference();

    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", handleMotionChange);
    } else {
      motionQuery.addListener(handleMotionChange);
    }

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updateViewport);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", updateBounds);
      }
      if (typeof motionQuery.removeEventListener === "function") {
        motionQuery.removeEventListener("change", handleMotionChange);
      } else {
        motionQuery.removeListener(handleMotionChange);
      }
    };
  }, []);

  if (!normalizedWords.length) {
    return null;
  }

  const overlayClassName = [styles.overlay, className].filter(Boolean).join(" ");
  const overlayStyle: CSSProperties & { "--radius"?: string } = {};

  if (typeof radius === "number") {
    overlayStyle["--radius"] = `${radius}px`;
  }

  return (
    <div
      ref={overlayRef}
      className={overlayClassName}
      style={overlayStyle}
      data-hide-coarse={hideOnCoarse ? "true" : "false"}
      data-active={active ? "true" : "false"}
      aria-hidden
    >
      <div className={styles.blurLayer} aria-hidden>
        {normalizedWords.map((word, index) => {
          const wordStyle: CSSProperties & { "--w"?: string } = {
            ...word.style,
            "--w": word.weight.toFixed(2),
          };
          return (
            <span
              key={`blur-${index}-${word.text}`}
              className={styles.word}
              style={wordStyle}
            >
              {word.text}
            </span>
          );
        })}
      </div>
      <div className={styles.sharpLayer} aria-hidden>
        {normalizedWords.map((word, index) => {
          const wordStyle: CSSProperties & { "--w"?: string } = {
            ...word.style,
            "--w": word.weight.toFixed(2),
          };
          return (
            <span
              key={`sharp-${index}-${word.text}`}
              className={styles.word}
              style={wordStyle}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
