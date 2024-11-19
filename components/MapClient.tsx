"use client";

import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { Venue } from "@/types/venue";
import { CAPE_TOWN_COORDS } from "@/lib/googlePlaces";
import { useEffect, useRef, useState } from "react";
import { scriptLoader } from "@/utils/scriptLoader";

interface MapClientProps {
  venues: Venue[];
}

declare global {
  interface Window {
    google: any;
  }
}

export default function MapClient({ venues }: MapClientProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function initializeMap() {
      try {
        // Fetch API key
        const response = await fetch("/api/map-init");
        const data = await response.json();

        if (!data.apiKey) {
          throw new Error("Failed to load API key");
        }

        // Load Google Maps script
        await scriptLoader.loadScript(
          `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`
        );

        setIsLoaded(true);
      } catch (err) {
        console.error("Map initialization error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load map"
        );
      }
    }

    initializeMap();
  }, []);

  useEffect(() => {
    if (isLoaded && containerRef.current && !mapRef.current) {
      // Initialize map
      mapRef.current = new window.google.maps.Map(
        containerRef.current,
        {
          center: CAPE_TOWN_COORDS,
          zoom: 11,
          gestureHandling: "cooperative",
        }
      );

      // Add markers
      venues?.forEach((venue) => {
        new window.google.maps.Marker({
          position: venue.location,
          map: mapRef.current,
          title: venue.name,
        });
      });
    }
  }, [isLoaded, venues]);

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-500">
          <p className="font-semibold">Error loading map</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-[400px] w-full relative">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse">Loading map...</div>
        </div>
      )}
    </div>
  );
}
