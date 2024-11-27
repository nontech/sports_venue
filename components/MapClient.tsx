"use client";

import { useEffect, useState, useRef } from "react";
import { Venue } from "@/types/venue";
import { CAPE_TOWN_COORDS } from "@/lib/googlePlaces";
import { scriptLoader } from "@/utils/scriptLoader";

interface MapClientProps {
  venues: Venue[];
  apiKey: string;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function MapClient({
  venues,
  apiKey,
}: MapClientProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function initializeMap() {
      try {
        await scriptLoader.loadScript(
          `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
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
  }, [apiKey]);

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
