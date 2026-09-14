"use client";

import { stats } from "@/config/marketing";
import { useInView } from "@/hooks/useInView";
import { useState, useEffect } from "react";

function StatItem({ value, label, index }: { value: string; label: string; index: number }) {
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: 0.3,
    triggerOnce: true,
  });

  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!isInView) return;

    // Simple clock-like flip animation - just show the value after a brief delay
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, index * 150);

    return () => clearTimeout(timer);
  }, [isInView, value, index]);

  return (
    <div
      ref={ref}
      className={`relative flex flex-col items-center justify-center p-4 text-center md:border-r md:border-white/10 last:border-0 transition-all duration-700 ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${
        index < 2
          ? "border-b border-white/10 md:border-b-0"
          : index % 2 === 0
            ? "border-r border-white/10 md:border-r"
            : ""
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Gradient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <span className="relative font-sora text-[32px] font-bold tracking-[-0.5px] text-white">
        {displayValue}
      </span>
      <span className="mt-1 text-xs text-white/50">{label}</span>
    </div>
  );
}

export function Stats() {
  return (
    <div className="relative grid grid-cols-2 md:grid-cols-4 bg-gradient-to-br from-navy via-navy-active to-navy p-6 md:px-12 md:py-8 overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-blue/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />

      {stats.map((stat, index) => (
        <StatItem key={stat.label} value={stat.value} label={stat.label} index={index} />
      ))}
    </div>
  );
}
