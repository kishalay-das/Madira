"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, Star } from "lucide-react";
import { Stars } from "@/components/ui/stars";
import { Button } from "@/components/ui/button";

export interface ProductReview {
  id: string;
  name: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
}

export function ReviewsPanel({
  slug,
  reviews,
  rating,
  reviewCount,
  isAuthed,
}: {
  slug: string;
  reviews: ProductReview[];
  rating: number;
  reviewCount: number;
  isAuthed: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch(`/api/products/${slug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: stars, title, body }),
    });
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      setTitle("");
      setBody("");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Could not submit review.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="font-display text-4xl text-cream">{rating.toFixed(1)}</span>
          <div>
            <Stars value={rating} />
            <p className="mt-1 text-xs text-muted">
              Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
        {isAuthed ? (
          <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
            Write a review
          </Button>
        ) : (
          <Button href={`/login?callbackUrl=/product/${slug}`} variant="outline" size="sm">
            Sign in to review
          </Button>
        )}
      </div>

      {open && (
        <form onSubmit={submit} className="rounded-xl border border-hairline bg-night/40 p-5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-muted">Your rating</span>
            <span className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStars(i + 1)}
                  aria-label={`${i + 1} stars`}
                >
                  <Star
                    size={18}
                    className={i < stars ? "fill-gold text-gold" : "text-muted-2"}
                  />
                </button>
              ))}
            </span>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review title"
            required
            className="mt-4 h-11 w-full rounded-xl border border-hairline bg-night/60 px-4 text-sm text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your tasting notes…"
            required
            rows={3}
            className="mt-3 w-full rounded-xl border border-hairline bg-night/60 px-4 py-3 text-sm text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none"
          />
          {error && <p className="mt-2 text-xs text-burgundy">{error}</p>}
          <Button type="submit" variant="gold" size="sm" className="mt-4" disabled={saving}>
            {saving && <Loader2 size={14} className="animate-spin" />}
            Submit Review
          </Button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="rounded-xl border border-hairline bg-night/40 p-5 text-sm text-muted">
          No reviews yet — be the first to share your impressions.
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-hairline bg-night/40 p-5">
              <div className="flex items-center justify-between">
                <Stars value={r.rating} size={13} />
                {r.verified && (
                  <span className="inline-flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.16em] text-emerald">
                    <BadgeCheck size={12} /> Verified
                  </span>
                )}
              </div>
              <p className="mt-2 font-display text-cream">{r.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-parchment/80">{r.body}</p>
              <p className="mt-2 text-[0.7rem] text-muted">— {r.name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
