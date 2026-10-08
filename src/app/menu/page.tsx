import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Media } from "@/components/Media";
import { MenuBoard } from "@/components/menu/MenuBoard";
import { menu } from "@/content/menu";

export const metadata: Metadata = {
  title: "Menu",
  description: "Nigiri, hand rolls, robata, small plates and sake at Gokudo.",
};

export default function MenuPage() {
  const images: Record<string, ReactNode> = {};
  for (const section of menu) {
    if (section.shot) {
      images[section.id] = <Media shot={section.shot} sizes="(min-width: 1024px) 30vw, 100vw" />;
    }
  }

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-4 pt-16 pb-10 md:px-8 md:pt-24">
        <h1 className="text-5xl font-semibold leading-none tracking-[-0.04em] md:text-7xl">Menu</h1>
        <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
          The fish changes with the market, so some dishes may differ on the night.
        </p>
      </section>
      <MenuBoard sections={menu} images={images} />
    </>
  );
}
