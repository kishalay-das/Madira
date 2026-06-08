import { Hero } from "@/components/sections/hero";
import { Categories } from "@/components/sections/categories";
import { BestSellers } from "@/components/sections/best-sellers";
import { Collections } from "@/components/sections/collections";
import { Recommendations } from "@/components/sections/recommendations";
import { Occasions } from "@/components/sections/occasions";
import { Membership } from "@/components/sections/membership";
import { Reviews } from "@/components/sections/reviews";
import { AppPromo } from "@/components/sections/app-promo";

export default function Home() {
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
