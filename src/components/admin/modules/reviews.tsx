"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AdminData, AdminReview } from "../types";
import { Panel } from "../shared";

export function Reviews({ data }: { data: AdminData }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(r: AdminReview) {
    if (!confirm("Delete this review? The product rating will be recalculated.")) return;
    setBusy(r.id);
    const res = await fetch(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Delete failed.");
    }
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-cream sm:text-3xl">Reviews</h1>
      <Panel className="!p-0 overflow-hidden">
        {data.reviews.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No reviews yet.</p>
        ) : (
          <div className="divide-y divide-[color:var(--color-hairline)]">
            {data.reviews.map((r) => (
              <div key={r.id} className="flex items-start gap-3 p-4 hover:bg-[var(--hover-soft)]">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-gold">
                      <Star size={12} className="fill-gold" /> {r.rating}
                    </span>
                    <span className="truncate text-sm text-cream">{r.title}</span>
                    {r.verified && <Badge tone="Best Seller">Verified</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{r.body}</p>
                  <p className="mt-1 text-[0.7rem] text-muted-2">
                    {r.author} · {r.product} · {r.date}
                  </p>
                </div>
                <button
                  onClick={() => remove(r)}
                  disabled={busy === r.id}
                  aria-label="Delete review"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-2 transition-colors hover:text-burgundy"
                >
                  {busy === r.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
