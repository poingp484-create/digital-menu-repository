import { Hero } from "@/components/home/Hero";
import { TwoWays } from "@/components/home/TwoWays";
import { Signatures } from "@/components/home/Signatures";
import { Robata } from "@/components/home/Robata";
import { ChefNote } from "@/components/home/ChefNote";
import { Room } from "@/components/home/Room";
import { Visit } from "@/components/home/Visit";
import { ReserveBand } from "@/components/home/ReserveBand";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TwoWays />
      <Signatures />
      <Robata />
      <ChefNote />
      <Room />
      <Visit />
      <ReserveBand />
    </>
  );
}
