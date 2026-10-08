import { Media } from "@/components/Media";
import { Reveal } from "@/components/motion/Reveal";
import { RailControls } from "@/components/home/RailControls";
import { signatures } from "@/content/menu";

export function Signatures() {
  return (
    <section aria-labelledby="signatures-title" className="py-24 md:py-32">
      <div className="mx-auto flex max-w-[1400px] items-end justify-between gap-6 px-4 md:px-8">
        <Reveal>
          <h2
            id="signatures-title"
            className="max-w-[18ch] text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
          >
            What people come back for.
          </h2>
        </Reveal>
        <RailControls target="signature-rail" />
      </div>

      <ul
        id="signature-rail"
        className="rail mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 md:scroll-px-8 md:gap-6 md:px-8 xl:px-[max(2rem,calc((100vw-1400px)/2+2rem))]"
      >
        {signatures.map((dish, i) => (
          <li key={dish.name} className="w-[78vw] shrink-0 snap-start sm:w-[44vw] lg:w-[30vw] xl:w-[400px]">
            <Reveal delay={i * 0.06}>
              <Media shot={dish.shot} sizes="(min-width: 1280px) 400px, (min-width: 1024px) 30vw, 78vw" />
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="text-lg font-medium">{dish.name}</h3>
                <span className="font-mono text-sm text-muted">${dish.price}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{dish.detail}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
