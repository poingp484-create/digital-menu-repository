import type { Metadata } from "next";
import { Media } from "@/components/Media";
import { Enter } from "@/components/motion/Enter";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { ReserveBand } from "@/components/home/ReserveBand";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Story",
  description: "How Gokudo cooks: the rice, the fish and the fire.",
};

const craft = [
  {
    title: "Rice",
    body: "We season koshihikari rice with red vinegar made from sake lees, the way the old Edo sushi shops did. It is served close to body temperature so the fish stays in focus.",
  },
  {
    title: "Fish",
    body: "Most of the fish flies in from Toyosu market three times a week. The rest comes from day boats on the East Coast. Some pieces are aged for several days to deepen their flavor.",
  },
  {
    title: "Fire",
    body: "The robata burns Kishu binchotan, a white oak charcoal that holds steady heat for hours with almost no smoke. Nothing on the grill is cooked ahead.",
  },
];

export default function StoryPage() {
  return (
    <>
      <section className="mx-auto grid max-w-[1400px] gap-12 px-4 pt-16 pb-24 md:px-8 md:pt-24 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <Enter>
            <h1 className="max-w-[12ch] text-5xl font-semibold leading-[0.98] tracking-[-0.04em] md:text-7xl">
              One counter, one grill.
            </h1>
          </Enter>
          <Enter delay={0.1}>
            <p className="mt-8 max-w-[48ch] text-lg leading-relaxed text-muted">
              Gokudo is twelve seats at a hinoki counter and a charcoal grill behind it. We kept it
              small on purpose, so the kitchen can cook every piece to order and talk to every guest.
            </p>
            <p className="mt-6 max-w-[48ch] leading-relaxed text-muted">
              {site.chef.name} leads the counter. The menu is written each afternoon, once the day&apos;s
              fish has arrived.
            </p>
          </Enter>
        </div>
        <Enter variant="settle" delay={0.1} className="lg:col-span-5 lg:col-start-8">
          <Media shot="chef" priority sizes="(min-width: 1024px) 40vw, 100vw" />
        </Enter>
      </section>

      <Parallax className="aspect-[16/9] max-h-[85dvh] w-full md:aspect-[21/9]" distance={48}>
        <Media shot="room" fill sizes="100vw" />
      </Parallax>

      <section className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
        <div className="divide-y divide-line border-y border-line">
          {craft.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.05} className="grid gap-4 py-12 md:grid-cols-12 md:gap-8 md:py-16">
              <h2 className="text-3xl font-semibold tracking-tight md:col-span-4 md:text-5xl">{c.title}</h2>
              <p className="max-w-[56ch] text-lg leading-relaxed text-muted md:col-span-7 md:col-start-6">
                {c.body}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <ReserveBand />
    </>
  );
}
