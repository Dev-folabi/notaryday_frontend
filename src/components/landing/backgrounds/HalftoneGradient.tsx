"use client";

import { useId } from "react";

interface HalftoneGradientProps {
  className?: string;
  fromColor?: string;
  toColor?: string;
  opacity?: number;
  direction?: "to-b" | "to-t" | "to-br" | "to-tr";
}

export function HalftoneGradient({
  className = "",
  fromColor = "#2563EB",
  toColor = "#0E7B6C",
  opacity = 0.03,
  direction = "to-br",
}: HalftoneGradientProps) {
  const id = useId();
  const gradientId = `halftone-gradient-${id}`;
  const patternId = `halftone-pattern-${id}`;

  // Convert Tailwind direction to SVG coordinates
  const gradientCoords = {
    "to-b": { x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
    "to-t": { x1: "0%", y1: "100%", x2: "0%", y2: "0%" },
    "to-br": { x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
    "to-tr": { x1: "0%", y1: "100%", x2: "100%", y2: "0%" },
  }[direction];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} {...gradientCoords}>
            <stop offset="0%" stopColor={fromColor} stopOpacity={opacity} />
            <stop offset="100%" stopColor={toColor} stopOpacity={opacity * 1.5} />
          </linearGradient>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="4" cy="4" r="1.5" fill={`url(#${gradientId})`} />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
