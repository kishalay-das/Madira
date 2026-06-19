/**
 * Sample blog posts used to seed the BlogPost table (shared by prisma/seed.ts
 * and scripts/seed-blog.ts). Content is light markdown: `## ` headings,
 * `- ` bullets, and blank-line-separated paragraphs (see the blog renderer).
 */
export interface BlogSeed {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
}

export const blogSeed: BlogSeed[] = [
  {
    slug: "how-to-build-a-starter-home-bar",
    title: "How to Build a Starter Home Bar (Without Overspending)",
    excerpt:
      "Five versatile bottles, a couple of mixers and the right glassware — everything you need to make great drinks at home.",
    coverImage: "/bottles/life/whiskey-2.jpg",
    author: "The BottleExpress Team",
    tags: ["guides", "home bar"],
    content: `Building a home bar doesn't mean buying forty bottles. With a handful of versatile spirits you can make dozens of classic drinks — and look like you know what you're doing.

## Start with five bottles

- A **whiskey** (bourbon is the most flexible)
- A **gin** for highballs and martinis
- A **white rum** for daiquiris and mojitos
- A **tequila** (blanco) for margaritas
- A **vermouth** to turn spirits into cocktails

## Don't forget the mixers

Tonic, soda water, citrus and a good simple syrup cover most of what you'll reach for. Fresh lemons and limes make a bigger difference than an expensive bottle ever will.

## Glassware that earns its place

You really only need two: a rocks glass and a tall highball. Add a coupe later if you fall for stirred-down classics.

Stock these, order a refill before you run dry, and you're set for almost any occasion.`,
  },
  {
    slug: "wine-pairing-basics",
    title: "Wine Pairing Basics: Match the Weight, Not Just the Colour",
    excerpt:
      "Forget 'red with meat, white with fish'. The real trick is matching the weight and intensity of the wine to the dish.",
    coverImage: "/bottles/life/champagne-2.jpg",
    author: "Ava Mercer",
    tags: ["wine", "pairing"],
    content: `The old rule — red with meat, white with fish — gets you halfway there and lets you down the rest of the time. A better instinct is to match **weight with weight**.

## Light with light, bold with bold

A delicate sole wants a crisp, light white. A rich, slow-cooked stew wants something with body and structure. When the wine and the food are about equally intense, neither one bullies the other.

## Acidity is your friend

High-acid wines cut through fat and salt — which is why Champagne works with almost everything fried. If a dish feels heavy, reach for something bright.

## When in doubt

- Sparkling wine is the most flexible pairing you can pour.
- Sweetness tames heat: an off-dry Riesling with spicy food is a revelation.
- Regional matches rarely fail — what grows together goes together.

Pour a little, taste, adjust. Pairing is a feel, not a formula.`,
  },
  {
    slug: "same-day-delivery-how-it-works",
    title: "Same-Day Delivery: How We Get Your Order to the Door",
    excerpt:
      "Order by 2pm and we'll have it with you today. Here's what happens between checkout and your doorstep.",
    coverImage: "/bottles/life/gin-2.jpg",
    author: "The BottleExpress Team",
    tags: ["delivery", "behind the scenes"],
    content: `We promise same-day delivery in select cities when you order before 2pm — but what actually happens after you hit checkout?

## 1. We pick and pack

Your order drops straight into our warehouse queue. Bottles are picked, wrapped to survive the trip, and staged for the next dispatch run.

## 2. Age verification

Every order is ID-checked at the door. It's quick, it's the law, and it keeps everyone safe — have your ID ready for the driver.

## 3. On the road

Once packed, your order is handed to a driver and tracked the whole way. You'll get updates so you know roughly when to expect the knock.

Miss the 2pm cut-off? No problem — you'll roll into the next-day window automatically.`,
  },
  {
    slug: "five-cocktails-three-bottles",
    title: "Five Cocktails You Can Make With Just Three Bottles",
    excerpt:
      "Gin, whiskey and a bottle of vermouth. That's all it takes for a week of proper cocktails.",
    coverImage: "/bottles/life/rum-1.jpg",
    author: "Marcus Vale",
    tags: ["cocktails", "guides"],
    content: `You don't need a back bar. With **gin**, **whiskey** and **sweet vermouth** you can pour five genuinely good cocktails.

## The five

- **Martini** — gin + a splash of dry vermouth, stirred cold.
- **Negroni-ish** — gin + sweet vermouth (add Campari if you have it).
- **Manhattan** — whiskey + sweet vermouth + bitters.
- **Old Fashioned** — whiskey + sugar + bitters.
- **Highball** — whiskey + soda, long and refreshing.

## The technique that matters most

Cold dilution. Stir spirit-forward drinks with plenty of ice until the glass frosts — it softens the alcohol and ties everything together. Skipping this is the single most common home-bar mistake.

Three bottles, five drinks, zero fuss. Restock before the weekend and you're sorted.`,
  },
];
