"use client";

import { PropsWithChildren, useId } from "react";
import styles from "../page.module.css";

type RoundedSlantClipProps = PropsWithChildren<{
  r?: number;
  tlY?: number;
  trY?: number;
  blY?: number;
  brY?: number;
  className?: string;
}>;

export default function RoundedSlantClip({
  r = 28,
  tlY = 0,
  trY = 80,
  blY = 80,
  brY = 0,
  className,
  children,
}: RoundedSlantClipProps) {
  const id = useId().replace(/:/g, "");
  const clipId = `roundedSlant-${id}`;

  const pathDefinition = [
    `M 1000,${trY + r}`,
    `A ${r} ${r} 0 0 0 ${1000 - r},${trY}`,
    `L ${r},${tlY}`,
    `A ${r} ${r} 0 0 0 0,${tlY + r}`,
    `L 0,${600 - blY - r}`,
    `A ${r} ${r} 0 0 0 ${r},${600 - blY}`,
    `L ${1000 - r},${600 - brY}`,
    `A ${r} ${r} 0 0 0 1000,${600 - brY - r}`,
    "Z",
  ]
    .map((segment) => segment.trim())
    .join(" ");

  const wrapperClassName = className ? `${styles.clipWrapper} ${className}` : styles.clipWrapper;

  return (
    <div className={wrapperClassName}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path
              d={pathDefinition}
              transform="scale(0.001, 0.001666667)"
              vectorEffect="non-scaling-stroke"
            />
          </clipPath>
        </defs>
      </svg>
      <div
        className={styles.clipContainer}
        style={{
          clipPath: `url(#${clipId})`,
          WebkitClipPath: `url(#${clipId})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
