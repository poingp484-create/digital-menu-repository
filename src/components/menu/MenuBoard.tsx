"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Fish, GrainsSlash, Leaf } from "@phosphor-icons/react";
import { tagLabels, type MenuItem, type MenuSection, type Tag } from "@/content/menu";
import { cn } from "@/lib/cn";

type Filter = "vegetarian" | "gluten-free" | "no-raw";

const filters: { id: Filter; label: string }[] = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "no-raw", label: "No raw fish" },
];

const tagIcons: Record<Tag, typeof Leaf> = {
  vegetarian: Leaf,
  "gluten-free": GrainsSlash,
  raw: Fish,
};

function matches(item: MenuItem, active: Set<Filter>) {
  const tags = item.tags ?? [];
  if (active.has("vegetarian") && !tags.includes("vegetarian")) return false;
  if (active.has("gluten-free") && !tags.includes("gluten-free")) return false;
  if (active.has("no-raw") && tags.includes("raw")) return false;
  return true;
}

function formatPrice(price: number | string) {
  return typeof price === "number" ? `$${price}` : price;
}

export function MenuBoard({
  sections,
  images,
}: {
  sections: MenuSection[];
  images: Record<string, ReactNode>;
}) {
  const [active, setActive] = useState<Set<Filter>>(new Set());
  const [current, setCurrent] = useState(sections[0]?.id);
  const reduce = useReducedMotion();
  const barRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () =>
      sections
        .map((s) => ({ ...s, items: s.items.filter((item) => matches(item, active)) }))
        .filter((s) => s.items.length > 0),
    [sections, active],
  );

  // Highlight the category the reader is in.
  useEffect(() => {
    const els = visible
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visible]);

  // Keep the active pill in view on narrow screens.
  useEffect(() => {
    const pill = barRef.current?.querySelector<HTMLElement>(`[data-id="${current}"]`);
    pill?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [current, reduce]);

  const toggle = (id: Filter) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-4 pb-8 md:px-8">
        <span id="filter-label" className="mr-2 text-sm text-muted">
          Show only
        </span>
        <div role="group" aria-labelledby="filter-label" className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const on = active.has(f.id);
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(f.id)}
                className={cn(
                  "btn h-9 px-4 text-sm",
                  on ? "btn-primary" : "btn-ghost",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky top-16 z-30 border-y border-line bg-bg/90 backdrop-blur-md">
        <nav aria-label="Menu categories" className="mx-auto max-w-[1400px] px-4 md:px-8">
          <div ref={barRef} className="rail flex gap-1 overflow-x-auto">
            {visible.map((s) => {
              const on = current === s.id;
              return (
                <a
                  key={s.id}
                  data-id={s.id}
                  href={`#${s.id}`}
                  aria-current={on ? "true" : undefined}
                  className={cn(
                    "relative shrink-0 px-3 py-4 text-sm whitespace-nowrap transition-colors",
                    on ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {s.title}
                  {on && (
                    <motion.span
                      layoutId="menu-indicator"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
                      className="absolute inset-x-3 bottom-0 h-0.5 bg-accent"
                    />
                  )}
                </a>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        {visible.length === 0 ? (
          <div className="flex flex-col items-start gap-6 py-32">
            <h2 className="text-3xl font-semibold tracking-tight">Nothing matches all of those.</h2>
            <p className="max-w-[46ch] text-muted">
              Try removing a filter, or tell us about your diet when you book and the kitchen will
              plan around it.
            </p>
            <button type="button" className="btn btn-ghost" onClick={() => setActive(new Set())}>
              Clear filters
            </button>
          </div>
        ) : (
          visible.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="grid gap-10 border-b border-line py-16 last:border-b-0 md:py-24 lg:grid-cols-12 lg:gap-8"
            >
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-40">
                  <h2
                    id={`${section.id}-title`}
                    className="text-3xl font-semibold tracking-tight md:text-4xl"
                  >
                    {section.title}
                  </h2>
                  {section.note && (
                    <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted">{section.note}</p>
                  )}
                  {images[section.id] && (
                    <div className="mt-8 hidden max-w-[360px] lg:block">{images[section.id]}</div>
                  )}
                </div>
              </div>

              <ul className="grid content-start gap-x-12 gap-y-10 sm:grid-cols-2 lg:col-span-8">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-lg font-medium">{item.name}</h3>
                      <span className="shrink-0 font-mono text-sm">{formatPrice(item.price)}</span>
                    </div>
                    {item.jp && <p className="mt-0.5 text-sm text-accent">{item.jp}</p>}
                    <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-muted">
                      {item.description}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <ul className="mt-3 flex gap-3 text-muted">
                        {item.tags.map((tag) => {
                          const Icon = tagIcons[tag];
                          return (
                            <li key={tag} className="flex items-center gap-1.5 text-xs">
                              <Icon size={14} aria-hidden="true" />
                              {tagLabels[tag]}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        <p className="max-w-[60ch] border-t border-line py-12 text-sm leading-relaxed text-muted">
          Tell your server about any allergies. Our kitchen handles shellfish, sesame, soy, wheat and
          egg, and we cannot rule out cross-contact.
        </p>
      </div>
    </>
  );
}
