"use client";

import { useInView } from "@/hooks/useInView";
import type { ReactNode } from "react";

interface AnimateInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "fade" | "slide-up" | "slide-left" | "slide-right" | "scale";
}

const variants = {
  fade: {
    initial: "opacity-0",
    animate: "opacity-100",
  },
  "slide-up": {
    initial: "opacity-0 translate-y-8",
    animate: "opacity-100 translate-y-0",
  },
  "slide-left": {
    initial: "opacity-0 translate-x-8",
    animate: "opacity-100 translate-x-0",
  },
  "slide-right": {
    initial: "opacity-0 -translate-x-8",
    animate: "opacity-100 translate-x-0",
  },
  scale: {
    initial: "opacity-0 scale-95",
    animate: "opacity-100 scale-100",
  },
};

export function AnimateIn({
  children,
  className = "",
  delay = 0,
  variant = "fade",
}: AnimateInProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: 0.1,
    triggerOnce: true,
  });

  const variantClasses = variants[variant];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isInView ? variantClasses.animate : variantClasses.initial
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
