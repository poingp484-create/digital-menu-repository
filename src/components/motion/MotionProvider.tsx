"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** With reduced motion on, Motion drops movement and keeps only fades. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
