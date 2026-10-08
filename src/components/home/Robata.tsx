import { Loop } from "@/components/Media";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";

export function Robata() {
  return (
    <section aria-labelledby="robata-title" className="relative min-h-[80dvh] overflow-hidden">
      <Parallax className="absolute inset-0">
        <Loop name="robata" sizes="100vw" />
      </Parallax>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgb(14_14_13/0.88),rgb(14_14_13/0.4)_55%,rgb(14_14_13/0.1))]"
      />
      <div className="relative mx-auto flex min-h-[80dvh] max-w-[1400px] items-end px-4 pb-16 md:px-8 md:pb-24">
        <Reveal className="max-w-[40rem] text-on-media">
          <h2 id="robata-title" className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Binchotan, all night.
          </h2>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-on-media/80">
            White oak charcoal from Kishu burns hot and clean. Skewers, black cod and wagyu are
            cooked over it to order.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
