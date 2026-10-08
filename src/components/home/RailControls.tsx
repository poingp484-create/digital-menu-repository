"use client";

import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

export function RailControls({ target }: { target: string }) {
  const scroll = (dir: 1 | -1) => {
    const rail = document.getElementById(target);
    if (!rail) return;
    const item = rail.querySelector("li");
    const step = item ? item.getBoundingClientRect().width + 24 : rail.clientWidth * 0.8;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="hidden shrink-0 gap-2 md:flex">
      <button
        type="button"
        aria-label="Previous dishes"
        aria-controls={target}
        onClick={() => scroll(-1)}
        className="btn btn-ghost size-11 px-0"
      >
        <ArrowLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="Next dishes"
        aria-controls={target}
        onClick={() => scroll(1)}
        className="btn btn-ghost size-11 px-0"
      >
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
