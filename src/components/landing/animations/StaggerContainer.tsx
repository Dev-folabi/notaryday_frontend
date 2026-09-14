"use client";

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 100,
}: StaggerContainerProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: 0.05,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child as ReactElement<any>, {
            style: {
              ...((child as ReactElement<any>).props.style || {}),
              transitionDelay: isInView ? `${index * staggerDelay}ms` : "0ms",
            },
            className: `${(child as ReactElement<any>).props.className || ""} transition-all duration-500 ease-out ${
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`,
          });
        }
        return child;
      })}
    </div>
  );
}
