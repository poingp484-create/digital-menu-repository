import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Media } from "@/components/Media";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/content/site";

export function TwoWays() {
  return (
    <section id="omakase" className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
      <Reveal>
        <h2 className="max-w-[16ch] text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Two ways to eat here.
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-16 md:grid-cols-12 md:gap-8">
        <Reveal className="md:col-span-7">
          <Media shot="counter" sizes="(min-width: 768px) 58vw, 100vw" />
          <div className="mt-8 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Omakase at the counter
              </h3>
              <p className="mt-3 max-w-[48ch] leading-relaxed text-muted">
                Around eighteen courses served piece by piece. Two seatings a night, at{" "}
                {site.seatings.join(" and ")}.
              </p>
            </div>
            <p className="font-mono text-sm text-muted">
              <span className="text-2xl text-ink">${site.omakasePrice}</span> per guest
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-5 md:mt-40">
          <Media shot="alacarte" sizes="(min-width: 768px) 42vw, 100vw" />
          <h3 className="mt-8 text-2xl font-semibold tracking-tight md:text-3xl">
            À la carte in the dining room
          </h3>
          <p className="mt-3 max-w-[44ch] leading-relaxed text-muted">
            Nigiri, hand rolls and robata to share. Walk-ins welcome at the bar most nights.
          </p>
          <Link
            href="/menu"
            className="group mt-6 inline-flex items-center gap-2 text-sm font-medium"
          >
            <span className="link-underline">See the menu</span>
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
