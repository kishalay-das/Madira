export type CategorySlug =
  | "whiskey"
  | "wine"
  | "champagne"
  | "vodka"
  | "gin"
  | "rum"
  | "tequila"
  | "craft-beer"
  | "gift-boxes";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  /* hue used for the generated bottle / artwork gradient */
  hue: string;
  count: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  distillery: string;
  category: CategorySlug;
  categoryLabel: string;
  price: number;
  compareAt?: number;
  abv: number;
  volume: string;
  origin: string;
  age?: string;
  rating: number;
  reviews: number;
  /* visual palette for the procedurally-rendered bottle (fallback) */
  palette: { glass: string; liquid: string; label: string };
  /* up to 4 uploaded product photos; falls back to the procedural bottle */
  images?: string[];
  /* optional product video URL (Cloudinary) */
  video?: string;
  tags: string[];
  tasting: { nose: string; palate: string; finish: string };
  notes: string[];
  pairings: string[];
  description: string;
  badge?: "Best Seller" | "Limited" | "New" | "Rare" | "Award Winner";
  stock: number;
}

export interface Collection {
  slug: string;
  title: string;
  subtitle: string;
  accent: string;
  count: number;
}

export interface Occasion {
  slug: string;
  title: string;
  blurb: string;
  accent: string;
}

export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  product: string;
  verified: boolean;
}

export interface CartItem {
  product: Product;
  qty: number;
}
