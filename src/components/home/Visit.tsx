import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/content/site";

export function Visit() {
  return (
    <section id="visit" aria-labelledby="visit-title" className="border-t border-line">
      <div className="mx-auto grid max-w-[1400px] gap-16 px-4 py-24 md:grid-cols-12 md:gap-8 md:px-8 md:py-32">
        <Reveal className="md:col-span-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Visit</p>
          <h2 id="visit-title" className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
            {site.address.line1}
            <br />
            <span className="text-muted">{site.address.line2}</span>
          </h2>
          <a
            href={site.address.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="group mt-8 inline-flex items-center gap-2 text-sm font-medium"
          >
            <span className="link-underline">Get directions</span>
            <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </Reveal>

        <Reveal delay={0.1} className="grid gap-12 sm:grid-cols-2 md:col-span-6 md:col-start-7">
          <div>
            <h3 className="text-sm font-medium text-muted">Hours</h3>
            <dl className="mt-4 space-y-4">
              {site.hours.map((h) => (
                <div key={h.days}>
                  <dt className="font-medium">{h.days}</dt>
                  <dd className="text-muted">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="space-y-10">
            <div>
              <h3 className="text-sm font-medium text-muted">Counter seatings</h3>
              <p className="mt-4 font-medium">{site.seatings.join(" and ")}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted">Contact</h3>
              <p className="mt-4 space-y-1">
                <a href={site.phone.href} className="link-underline block w-fit font-medium">
                  {site.phone.display}
                </a>
                <a href={`mailto:${site.email}`} className="link-underline block w-fit font-medium">
                  {site.email}
                </a>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
