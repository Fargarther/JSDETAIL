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
};

type NormalizedWord = {
  text: string;
  style: CSSProperties;
  weight: number;
};

const DEFAULT_WEIGHT = 0.8;
const PRESET_POSITIONS: Array<Omit<PositionedWord, "text">> = [
  { style: { top: "6%", left: "12%" }, weight: 1.1 },
  { style: { top: "18%", right: "14%" }, weight: 0.65 },
  { style: { bottom: "24%", left: "14%" }, weight: 0.85 },
  { style: { bottom: "12%", right: "10%" }, weight: 1.2 },
  { style: { top: "54%", right: "4%" }, weight: 0.5 },
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
}: FlavorWordsOverlayProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const normalizedWords = useMemo(() => normalizeWords(words), [words]);

  useEffect(() => {
    const overlay = overlayRef.current;

    if (!overlay || typeof window === "undefined") {
      return;
    }

    let frame = 0;
    let prefersReducedMotion = false;
    let pointerActive = false;
    const pointer = { x: 0, y: 0 };
    const bounds = { left: 0, top: 0, width: 0, height: 0 };

    const applyFrame = () => {
      frame = 0;
      if (!pointerActive || prefersReducedMotion) {
        return;
      }

      const relativeX = pointer.x - bounds.left;
      const relativeY = pointer.y - bounds.top;
      if (bounds.width === 0 || bounds.height === 0) {
        return;
      }

      const clampedX = clamp(relativeX, 0, bounds.width);
      const clampedY = clamp(relativeY, 0, bounds.height);

      overlay.style.setProperty("--mx", `${clampedX}px`);
      overlay.style.setProperty("--my", `${clampedY}px`);

      const normalizedX = clamp((clampedX / bounds.width) * 2 - 1, -1, 1);
      const normalizedY = clamp((clampedY / bounds.height) * 2 - 1, -1, 1);
      overlay.style.setProperty("--dx", normalizedX.toFixed(4));
      overlay.style.setProperty("--dy", normalizedY.toFixed(4));
    };

    const scheduleFrame = () => {
      if (prefersReducedMotion || frame) {
        return;
      }
      frame = window.requestAnimationFrame(applyFrame);
    };

    const parkReveal = () => {
      pointerActive = false;
      if (prefersReducedMotion) {
        return;
      }
      overlay.style.setProperty("--mx", "-999px");
      overlay.style.setProperty("--my", "-999px");
      overlay.style.setProperty("--dx", "0");
      overlay.style.setProperty("--dy", "0");
    };

    const updateBounds = () => {
      const rect = overlay.getBoundingClientRect();
      bounds.left = rect.left;
      bounds.top = rect.top;
      bounds.width = rect.width;
      bounds.height = rect.height;
      if (pointerActive && !prefersReducedMotion) {
        scheduleFrame();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;

      if (prefersReducedMotion) {
        return;
      }

      const withinX =
        pointer.x >= bounds.left && pointer.x <= bounds.left + bounds.width;
      const withinY =
        pointer.y >= bounds.top && pointer.y <= bounds.top + bounds.height;
      const inside = withinX && withinY;

      if (inside) {
        pointerActive = true;
        scheduleFrame();
      } else if (pointerActive) {
        parkReveal();
      }
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) {
        parkReveal();
      }
    };

    const handleScroll = () => {
      updateBounds();
    };

    updateBounds();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            updateBounds();
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
      } else {
        parkReveal();
      }
    };

    const handleMotionChange = () => {
      applyMotionPreference();
    };

    applyMotionPreference();
    parkReveal();

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
      aria-hidden
    >
      <div className={styles.blurLayer} aria-hidden>
        {normalizedWords.map((word, index) => {
          const wordStyle: CSSProperties & { "--w"?: string } = {
            ...word.style,
            "--w": word.weight.toString(),
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
            "--w": word.weight.toString(),
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
