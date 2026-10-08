import type { Metadata } from "next";
import { ReservationForm } from "@/components/reserve/ReservationForm";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Reserve",
  description: "Request a seat at the Gokudo counter or a table in the dining room.",
};

const notes = [
  "Counter seats are released 30 days ahead at 10:00 am.",
  "The counter seats parties of up to 4. The dining room seats up to 8.",
  "We hold tables for 15 minutes after the booked time.",
  "Cancel at least 48 hours ahead to avoid a $50 per guest charge.",
];

export default function ReservePage() {
  return (
    <section className="mx-auto grid max-w-[1400px] gap-16 px-4 pt-16 pb-24 md:px-8 md:pt-24 md:pb-32 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-4">
        <h1 className="text-5xl font-semibold leading-none tracking-[-0.04em] md:text-7xl">Reserve</h1>
        <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-muted">
          Send a request and we will confirm by email. For tonight, call{" "}
          <a href={site.phone.href} className="link-underline text-ink">
            {site.phone.display}
          </a>
          .
        </p>
        <ul className="mt-12 space-y-4 border-t border-line pt-8 text-sm leading-relaxed text-muted">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
      <div className="lg:col-span-7 lg:col-start-6">
        <ReservationForm />
      </div>
    </section>
  );
}
