import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Media } from "@/components/Media";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/content/site";

export function ChefNote() {
  return (
    <section className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 py-24 md:grid-cols-12 md:gap-8 md:px-8 md:py-32">
      <Reveal className="md:col-span-4">
        <Media shot="chef" sizes="(min-width: 768px) 33vw, 100vw" />
      </Reveal>
      <Reveal delay={0.1} className="md:col-span-7 md:col-start-6">
        <figure>
          <blockquote className="text-3xl font-medium leading-[1.2] tracking-tight md:text-5xl">
            “We buy what the boats bring in that morning. The menu is written after.”
          </blockquote>
          <figcaption className="mt-8 text-sm text-muted">
            {site.chef.name}, {site.chef.role.toLowerCase()}
          </figcaption>
        </figure>
        <Link href="/story" className="group mt-10 inline-flex items-center gap-2 text-sm font-medium">
          <span className="link-underline">Read our story</span>
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </section>
  );
}
