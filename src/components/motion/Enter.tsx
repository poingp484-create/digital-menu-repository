"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Plays once on page load, for above-the-fold content. */
export function Enter({
  children,
  delay = 0,
  className,
  variant = "rise",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: "rise" | "settle";
}) {
  const from = variant === "rise" ? { opacity: 0, y: 28 } : { opacity: 0, scale: 1.06 };
  const to = variant === "rise" ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 };
  return (
    <motion.div
      className={className}
      initial={from}
      animate={to}
      transition={{ duration: variant === "rise" ? 0.9 : 1.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
