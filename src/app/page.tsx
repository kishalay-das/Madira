import type { Metadata } from "next";
import { getMode } from "@/lib/mode";
import { StandardHome } from "@/components/sections/standard-home";
import { Hero } from "@/components/sections/hero";
import { Categories } from "@/components/sections/categories";
import { BestSellers } from "@/components/sections/best-sellers";
import { Collections } from "@/components/sections/collections";
import { Recommendations } from "@/components/sections/recommendations";
import { Occasions } from "@/components/sections/occasions";
import { Membership } from "@/components/sections/membership";
import { Reviews } from "@/components/sections/reviews";
import { AppPromo } from "@/components/sections/app-promo";

export const dynamic = "force-dynamic";

// Home page title is the brand name only (absolute → bypasses the
// "%s · Kishalay Madeera" template).
export const metadata: Metadata = {
  title: { absolute: "Kishalay Madeera" },
};

export default async function Home() {
  const mode = await getMode();
  if (mode === "standard") return <StandardHome />;
  return (
    <>
      <Hero />
      <Categories />
      <BestSellers />
      <Collections />
      <Recommendations />
      <Occasions />
      <Membership />
      <Reviews />
      <AppPromo />
    </>
  );
}
