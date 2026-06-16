"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { defaultIcon, loadLeaflet, type LMap } from "@/lib/leaflet-loader";

/**
 * Renders an order's delivery pin on a Leaflet/OpenStreetMap map and reverse-
 * geocodes the coordinates to a street address via the free Nominatim API.
 * Leaflet loads from a CDN on demand (see leaflet-loader) and only touches the
 * DOM inside effects, so it is safe inside the server-rendered admin tree.
 */
export function DeliveryMap({
  lat,
  lng,
  accuracy,
  label,
}: {
  lat: number;
  lng: number;
  accuracy: number | null;
  label: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [placeLoading, setPlaceLoading] = useState(true);

  // Build the map imperatively once coordinates are known.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadLeaflet()
      .then((L) => {
        if (cancelled || !elRef.current) return;
        const map = L.map(elRef.current, { scrollWheelZoom: false });
        mapRef.current = map;
        map.setView([lat, lng], 16);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);
        L.marker([lat, lng], { icon: defaultIcon(L) })
          .addTo(map)
          .bindPopup(`Delivery · ${label}`)
          .openPopup();
        if (accuracy && accuracy > 0) {
          L.circle([lat, lng], {
            radius: accuracy,
            color: "#c8a24b",
            fillColor: "#c8a24b",
            fillOpacity: 0.12,
            weight: 1,
          }).addTo(map);
        }
        // The modal animates in; recalc tiles once it has settled.
        setTimeout(() => map.invalidateSize(), 60);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Map failed to load.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, accuracy, label]);

  // Reverse geocode (Nominatim — free, ≤1 req/sec; one call per opened order).
  useEffect(() => {
    let cancelled = false;
    setPlaceLoading(true);
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { Accept: "application/json" } }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { display_name?: string } | null) => {
        if (!cancelled) setPlace(d?.display_name ?? null);
      })
      .catch(() => {
        if (!cancelled) setPlace(null);
      })
      .finally(() => {
        if (!cancelled) setPlaceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  const osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

  return (
    <div className="space-y-2">
      <div className="relative h-56 w-full overflow-hidden rounded-xl border border-hairline">
        <div ref={elRef} className="absolute inset-0 z-0 h-full w-full bg-night" />
        {loading && !error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-night/60 text-muted">
            <Loader2 size={18} className="animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-night/70 px-4 text-center text-xs text-burgundy">
            {error}
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-3 text-xs">
        <p className="min-w-0">
          {placeLoading ? (
            <span className="text-muted">Looking up address…</span>
          ) : place ? (
            <span className="text-parchment">{place}</span>
          ) : (
            <span className="text-muted">Address lookup unavailable.</span>
          )}
          <span className="mt-0.5 block text-muted-2">
            {lat.toFixed(5)}, {lng.toFixed(5)}
            {accuracy ? ` · ±${Math.round(accuracy)} m` : ""}
          </span>
        </p>
        <a
          href={osmLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-gold transition-colors hover:text-gold-bright"
        >
          <ExternalLink size={12} /> Open in OSM
        </a>
      </div>
    </div>
  );
}
