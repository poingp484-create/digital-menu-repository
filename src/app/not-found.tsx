import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70dvh] max-w-[1400px] flex-col items-start justify-center gap-8 px-4 md:px-8">
      <h1 className="max-w-[14ch] text-5xl font-semibold leading-[1] tracking-[-0.04em] md:text-7xl">
        This page is not on the menu.
      </h1>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link href="/menu" className="btn btn-ghost">
          See the menu
        </Link>
      </div>
    </section>
  );
}
