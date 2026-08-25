"use client";

import type { MouseEvent, ReactNode } from "react";

interface SummaryItem {
  value: ReactNode;
  label: string;
}

interface DaySummaryStripProps {
  items: SummaryItem[];
  onClick?: () => void;
  action?: {
    label: string;
    icon: ReactNode;
    onClick: () => void;
  };
  cursor?: "default";
}

export default function DaySummaryStrip({
  items,
  onClick,
  action,
  cursor,
}: DaySummaryStripProps) {
  const handleAction = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    action?.onClick();
  };

  return (
    <div className="dstrip" style={cursor ? { cursor } : undefined} onClick={onClick}>
      {items.map((item, index) => (
        <div className="contents" key={item.label}>
          {index > 0 && <div className="ds-div" />}
          <div className="ds">
            <span className="ds-v">{item.value}</span>
            <span className="ds-l">{item.label}</span>
          </div>
        </div>
      ))}
      {action && (
        <button className="sday-btn" onClick={handleAction}>
          {action.icon} {action.label}
        </button>
      )}
    </div>
  );
}
