import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Media } from "@/components/Media";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/content/site";

export function Room() {
  return (
    <section aria-labelledby="room-title" className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
      <Reveal>
        <h2 id="room-title" className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          A small room, kept dark.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-4 md:grid-cols-4 md:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] md:gap-6 lg:h-[720px]">
        <Reveal className="relative aspect-[16/10] md:col-span-2 md:row-span-2 md:aspect-auto">
          <Media shot="room" fill sizes="(min-width: 768px) 50vw, 100vw" />
        </Reveal>
        <Reveal delay={0.06} className="relative aspect-[3/4] md:row-span-2 md:aspect-auto">
          <Media shot="entrance" fill sizes="(min-width: 768px) 25vw, 100vw" />
        </Reveal>
        <Reveal delay={0.12} className="relative aspect-[4/3] md:aspect-auto">
          <Media shot="privateRoom" fill sizes="(min-width: 768px) 25vw, 100vw" />
        </Reveal>
        <Reveal delay={0.18} className="flex flex-col justify-between gap-8 bg-accent p-6 text-accent-ink">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Private room</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-85">
              Up to {site.privateDining.guests} guests on tatami, with a set menu from $
              {site.privateDining.from} per person.
            </p>
          </div>
          <a
            href={`mailto:${site.email}?subject=Private%20room`}
            className="inline-flex items-center gap-2 text-sm font-medium"
          >
            <span className="link-underline">Ask about dates</span>
            <ArrowUpRight size={16} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
