"use client";

import { PropsWithChildren, useId } from "react";
import styles from "../page.module.css";

type ACGClipProps = PropsWithChildren<{
  topSlant?: number;
  bottomSlant?: number;
  radius?: number;
  className?: string;
}>;

export default function ACGClip({
  topSlant = 0.08,
  bottomSlant = 0.06,
  radius = 0.04,
  className,
  children,
}: ACGClipProps) {
  const id = useId();
  const clipId = `acg-${id}`;

  const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

  const arc = clamp(radius, 0, 0.2);
  const topLeftY = clamp(topSlant, 0, 1);
  const topRightY = clamp(0, 0, 1);
  const bottomLeftY = clamp(1 - bottomSlant, 0, 1);
  const bottomRightY = 1;

  const points = [
    { x: 0, y: topLeftY },
    { x: 1, y: topRightY },
    { x: 1, y: bottomRightY },
    { x: 0, y: bottomLeftY },
  ];

  const offsetPoint = (p: { x: number; y: number }, q: { x: number; y: number }) => {
    const vx = q.x - p.x;
    const vy = q.y - p.y;
    const length = Math.hypot(vx, vy) || 1;
    const distance = Math.min(arc, length / 2);
    return {
      x: p.x + (vx / length) * distance,
      y: p.y + (vy / length) * distance,
    };
  };

  const corners = points.map((point, index) => {
    const prev = points[(index + points.length - 1) % points.length];
    const next = points[(index + 1) % points.length];
    return {
      control: point,
      entry: offsetPoint(point, prev),
      exit: offsetPoint(point, next),
    };
  });

  const format = (value: number) => Number(value.toFixed(6)).toString();

  const d = `
    M ${format(corners[0].entry.x)} ${format(corners[0].entry.y)}
    Q ${format(corners[0].control.x)} ${format(corners[0].control.y)} ${format(corners[0].exit.x)} ${format(corners[0].exit.y)}
    L ${format(corners[1].entry.x)} ${format(corners[1].entry.y)}
    Q ${format(corners[1].control.x)} ${format(corners[1].control.y)} ${format(corners[1].exit.x)} ${format(corners[1].exit.y)}
    L ${format(corners[2].entry.x)} ${format(corners[2].entry.y)}
    Q ${format(corners[2].control.x)} ${format(corners[2].control.y)} ${format(corners[2].exit.x)} ${format(corners[2].exit.y)}
    L ${format(corners[3].entry.x)} ${format(corners[3].entry.y)}
    Q ${format(corners[3].control.x)} ${format(corners[3].control.y)} ${format(corners[3].exit.x)} ${format(corners[3].exit.y)}
    Z
  `;

  return (
    <div className={className}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={d} />
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
