import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";

export function ReserveBand() {
  return (
    <section className="bg-surface">
      <Reveal className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-10 px-4 py-20 md:flex-row md:items-end md:px-8 md:py-28">
        <h2 className="max-w-[16ch] text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Counter seats open 30 days ahead.
        </h2>
        <Link href="/reserve" className="btn btn-primary h-12 px-7 text-base">
          Reserve
        </Link>
      </Reveal>
    </section>
  );
}
