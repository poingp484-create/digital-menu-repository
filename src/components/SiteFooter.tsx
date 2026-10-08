import Link from "next/link";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { nav, site } from "@/content/site";
import { Wordmark } from "./Wordmark";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <Wordmark />
          <p className="mt-6 max-w-[34ch] text-sm leading-relaxed text-muted">{site.description}</p>
        </div>

        <nav aria-label="Footer" className="md:col-span-2">
          <ul className="flex flex-col gap-3 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline text-muted hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/reserve" className="link-underline text-muted hover:text-ink">
                Reserve
              </Link>
            </li>
          </ul>
        </nav>

        <address className="text-sm not-italic leading-relaxed text-muted md:col-span-3">
          {site.address.line1}
          <br />
          {site.address.line2}
          <br />
          <a href={site.phone.href} className="link-underline hover:text-ink">
            {site.phone.display}
          </a>
          <br />
          <a href={`mailto:${site.email}`} className="link-underline hover:text-ink">
            {site.email}
          </a>
        </address>

        <div className="md:col-span-2 md:justify-self-end">
          <a
            href={site.instagram}
            aria-label="Gokudo on Instagram"
            className="grid size-11 place-items-center border border-line-strong transition-colors hover:border-ink"
          >
            <InstagramLogo size={20} />
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-4 pb-10 text-xs text-muted md:px-8">
        © {new Date().getFullYear()} Gokudo
      </div>
    </footer>
  );
}
