"use client";
import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: string; // e.g. "15,000+" or "19+"
  duration?: number; // ms
}

function parseValue(raw: string): { num: number; suffix: string } {
  // Remove commas, extract leading number
  const cleaned = raw.replace(/,/g, "");
  const match = cleaned.match(/^(\d+)(.*)$/);
  if (!match) return { num: 0, suffix: raw };
  return { num: parseInt(match[1], 10), suffix: match[2] };
}

function formatNum(n: number, original: string): string {
  // Re-apply comma formatting if original had it
  if (original.includes(",")) {
    return n.toLocaleString();
  }
  return String(n);
}

export default function CountUp({ value, duration = 1800 }: CountUpProps) {
  const { num, suffix } = parseValue(value);
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();

          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * num));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [num, duration]);

  return (
    <span ref={ref}>
      {formatNum(display, value)}
      {suffix}
    </span>
  );
}
