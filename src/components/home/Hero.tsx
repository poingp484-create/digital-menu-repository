import Link from "next/link";
import { Loop } from "@/components/Media";
import { Enter } from "@/components/motion/Enter";
import TextAnimation from "@/components/ui/staggerText";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1400px] gap-10 px-4 pt-10 pb-16 md:px-8 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-12 lg:gap-8 lg:pt-12 lg:pb-12">
      <div className="flex flex-col justify-end lg:col-span-6 lg:pb-8">
        <Enter>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Japanese counter and grill
          </p>
        </Enter>
        <h1 className="mt-6 max-w-[11ch] text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          <TextAnimation delay={0.08}>Fish, rice and fire.</TextAnimation>
        </h1>
        <Enter delay={0.16}>
          <p className="mt-8 max-w-[44ch] text-lg leading-relaxed text-muted">
            Omakase at a twelve-seat hinoki counter, robata over binchotan, and a menu set by the
            morning market.
          </p>
        </Enter>
        <Enter delay={0.24} className="mt-10 flex flex-wrap gap-3">
          <Link href="/reserve" className="btn btn-primary">
            Reserve
          </Link>
          <Link href="/menu" className="btn btn-ghost">
            See the menu
          </Link>
        </Enter>
      </div>

      <Enter
        variant="settle"
        className="relative aspect-[4/5] lg:col-span-6 lg:aspect-auto lg:min-h-[560px]"
      >
        <Loop name="hero" priority sizes="(min-width: 1024px) 50vw, 100vw" />
      </Enter>
    </section>
  );
}
