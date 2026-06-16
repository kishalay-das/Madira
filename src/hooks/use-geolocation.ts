"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Secure-context-aware wrapper around the browser Geolocation API.
 *
 * Status machine (checked in this order):
 *   insecure     — not https / not localhost → never prompts
 *   unsupported  — navigator.geolocation missing
 *   idle         — ready; waiting for the user to opt in (no prompt yet)
 *   loading      — prompt shown / position resolving
 *   success      — coords available
 *   denied|unavailable|timeout — failure reasons (GeolocationPositionError codes)
 */
export type GeoStatus =
  | "insecure"
  | "unsupported"
  | "idle"
  | "loading"
  | "success"
  | "denied"
  | "unavailable"
  | "timeout";

export interface GeoCoords {
  lat: number;
  lng: number;
  accuracy: number; // metres
}

export interface GeoState {
  status: GeoStatus;
  coords: GeoCoords | null;
  error: string | null;
}

const ERROR_MAP: Record<number, { status: GeoStatus; msg: string }> = {
  1: { status: "denied", msg: "Location permission was denied." },
  2: { status: "unavailable", msg: "Location is currently unavailable." },
  3: { status: "timeout", msg: "Location request timed out — please try again." },
};

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    status: "idle",
    coords: null,
    error: null,
  });

  // Resolve the environment guards on mount (keeps SSR markup === first client
  // render, avoiding hydration mismatches — we always start "idle").
  useEffect(() => {
    if (!window.isSecureContext) {
      setState({
        status: "insecure",
        coords: null,
        error: "Location requires a secure (HTTPS) connection.",
      });
    } else if (!("geolocation" in navigator)) {
      setState({
        status: "unsupported",
        coords: null,
        error: "Your browser does not support location.",
      });
    }
  }, []);

  const request = useCallback(() => {
    if (!window.isSecureContext) {
      setState({
        status: "insecure",
        coords: null,
        error: "Location requires a secure (HTTPS) connection.",
      });
      return;
    }
    if (!("geolocation" in navigator)) {
      setState({
        status: "unsupported",
        coords: null,
        error: "Your browser does not support location.",
      });
      return;
    }

    setState((s) => ({ ...s, status: "loading", error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: "success",
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
          error: null,
        });
      },
      (err) => {
        const mapped =
          ERROR_MAP[err.code] ?? {
            status: "unavailable" as GeoStatus,
            msg: "Could not determine your location.",
          };
        setState({ status: mapped.status, coords: null, error: mapped.msg });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, []);

  return { ...state, request };
}
