"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Animation = "fadeUp" | "fadeLeft" | "fadeRight" | "scaleIn";

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

const animationMap: Record<Animation, string> = {
  fadeUp: "animate-fade-up",
  fadeLeft: "animate-fade-left",
  fadeRight: "animate-fade-right",
  scaleIn: "animate-scale-in",
};

export default function AnimateOnScroll({
  children,
  animation = "fadeUp",
  delay = 0,
  duration = 0.5,
  className = "",
  threshold = 0.15,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transition = `opacity ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`;

    const animationStyles: Record<Animation, string> = {
      fadeUp: "translateY(24px)",
      fadeLeft: "translateX(-24px)",
      fadeRight: "translateX(24px)",
      scaleIn: "scale(0.95)",
    };
    el.style.transform = animationStyles[animation];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "none";
          observer.unobserve(el);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animation, delay, duration, threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
