/**
 * Loads Leaflet from the free unpkg CDN on demand (no npm dependency, so the
 * production `npm ci` build needs no network for it). Map tiles already come
 * from the network at runtime, so loading the library the same way is
 * consistent. The promise is memoised — the script/CSS are injected once.
 */

const LEAFLET_VERSION = "1.9.4";
const CSS_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const JS_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
const ICON_BASE = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/images`;

/* Minimal typings for the subset of the Leaflet API this app uses (avoids
   pulling in @types/leaflet for a CDN global). */
export interface LMap {
  setView(center: [number, number], zoom: number): LMap;
  flyTo(center: [number, number], zoom?: number): void;
  remove(): void;
  invalidateSize(): void;
}
export interface LLayer {
  addTo(map: LMap): LLayer;
  bindPopup(html: string): LLayer;
  openPopup(): LLayer;
}
export interface LeafletNS {
  map(el: HTMLElement, opts?: Record<string, unknown>): LMap;
  tileLayer(url: string, opts?: Record<string, unknown>): LLayer;
  marker(latlng: [number, number], opts?: Record<string, unknown>): LLayer;
  circle(latlng: [number, number], opts?: Record<string, unknown>): LLayer;
  icon(opts: Record<string, unknown>): unknown;
}

declare global {
  interface Window {
    L?: LeafletNS;
  }
}

let cached: Promise<LeafletNS> | null = null;

export function loadLeaflet(): Promise<LeafletNS> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Leaflet can only load in the browser."));
  }
  if (window.L) return Promise.resolve(window.L);
  if (cached) return cached;

  cached = new Promise<LeafletNS>((resolve, reject) => {
    if (!document.querySelector("link[data-leaflet]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_URL;
      link.setAttribute("data-leaflet", "");
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = JS_URL;
    script.async = true;
    script.onload = () => {
      if (window.L) resolve(window.L);
      else reject(new Error("Leaflet loaded but global L is missing."));
    };
    script.onerror = () => {
      cached = null;
      reject(new Error("Failed to load the map library."));
    };
    document.body.appendChild(script);
  });
  return cached;
}

/** Default marker icon served from the same CDN (so pins always render). */
export function defaultIcon(L: LeafletNS) {
  return L.icon({
    iconUrl: `${ICON_BASE}/marker-icon.png`,
    iconRetinaUrl: `${ICON_BASE}/marker-icon-2x.png`,
    shadowUrl: `${ICON_BASE}/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}
