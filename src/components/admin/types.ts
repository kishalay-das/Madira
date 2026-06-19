export type Tab =
  | "dashboard"
  | "products"
  | "orders"
  | "customers"
  | "coupons"
  | "reviews"
  | "blog";

export interface AdminData {
  kpis: {
    revenue: number;
    orders: number;
    customers: number;
    aov: number;
    /* % change vs the previous 30-day window (0 when no prior history) */
    revenueTrend: number;
    ordersTrend: number;
  };
  /* 14-point daily revenue series (oldest → newest) for sparklines */
  revenueByDay: number[];
  ordersByDay: number[];
  /* revenue attributed to each storefront segment */
  revenueBySegment: { PREMIUM: number; STANDARD: number };
  /* best sellers by units sold (derived from order items) */
  topProducts: {
    name: string;
    slug: string;
    units: number;
    revenue: number;
    segment: string;
  }[];
  topCategories: { c: string; pct: number; hue: string }[];
  products: {
    id: string;
    slug: string;
    name: string;
    distillery: string;
    categoryLabel: string;
    price: number;
    stock: number;
    palette: { glass: string; liquid: string; label: string };
    category: string;
    images?: string[];
    segment: string;
  }[];
  orders: {
    id: string;
    number: string;
    segment: string;
    customer: string;
    customerEmail: string;
    total: number;
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    status: string;
    statusLabel: string;
    deliverySlot: string;
    paymentMethod: string;
    codFee: number;
    giftWrap: boolean;
    date: string;
    /* sortable ISO timestamp for date-range filtering */
    createdAt: string;
    couponCode: string | null;
    address: string | null;
    /* delivery contact phone from the saved address, if provided */
    deliveryPhone: string | null;
    /* optional delivery pin captured at order time (browser geolocation) */
    deliveryLat: number | null;
    deliveryLng: number | null;
    deliveryAccuracy: number | null;
    items: { name: string; slug: string; quantity: number; unitPrice: number }[];
  }[];
  customers: {
    id: string;
    name: string;
    email: string;
    tier: string;
    loyaltyPoints: number;
    referralCode: string;
    memberSince: string;
    orders: number;
    spend: number;
    /* average order value for this customer */
    aov: number;
    /* formatted date of most recent order, or null if none */
    lastPurchase: string | null;
    /* derived insight tags: "VIP" | "High spender" | "At risk" | "New" */
    tags: string[];
    addresses: { label: string; line: string }[];
    recentOrders: {
      number: string;
      total: number;
      statusLabel: string;
      date: string;
    }[];
  }[];
  coupons: {
    id: string;
    code: string;
    description: string;
    percentOff: number | null;
    amountOff: number | null;
    active: boolean;
    expiresAt: string | null;
    redemptions: number;
  }[];
  reviews: {
    id: string;
    product: string;
    productSlug: string;
    author: string;
    rating: number;
    title: string;
    body: string;
    verified: boolean;
    date: string;
  }[];
  categoryOptions: { slug: string; name: string }[];
  blog: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    author: string;
    tags: string[];
    published: boolean;
    date: string;
  }[];
}

export type AdminBlogPost = AdminData["blog"][number];

export type AdminProduct = AdminData["products"][number];
export type AdminOrder = AdminData["orders"][number];
export type AdminCustomer = AdminData["customers"][number];
export type AdminCoupon = AdminData["coupons"][number];
export type AdminReview = AdminData["reviews"][number];
