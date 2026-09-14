import { useEffect, useState } from "react";

interface UseCountUpOptions {
  end: number;
  duration?: number;
  start?: number;
  enabled?: boolean;
}

export function useCountUp({
  end,
  duration = 2000,
  start = 0,
  enabled = true,
}: UseCountUpOptions) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!enabled) return;

    const startTime = Date.now();
    const endTime = startTime + duration;
    const range = end - start;

    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentCount = Math.floor(start + range * easeOut);
      setCount(currentCount);

      if (now >= endTime) {
        setCount(end);
        clearInterval(timer);
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [end, duration, start, enabled]);

  return count;
}
