"use client";

import { useId } from "react";

interface DotGridProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  dotSpacing?: number;
  opacity?: number;
}

export function DotGrid({
  className = "",
  dotColor = "#0F2C4E",
  dotSize = 1,
  dotSpacing = 24,
  opacity = 0.08,
}: DotGridProps) {
  const id = useId();
  const patternId = `dot-pattern-${id}`;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={dotSpacing}
            height={dotSpacing}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={dotSpacing / 2}
              cy={dotSpacing / 2}
              r={dotSize}
              fill={dotColor}
              opacity={opacity}
            />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
