"use client";

import { useEffect, useState, useRef } from "react";
import { Venue } from "@/types/venue";
import { CAPE_TOWN_COORDS } from "@/lib/googlePlaces";
import { scriptLoader } from "@/utils/scriptLoader";

interface MapProps {
  venues: Venue[];
}

// Define minimal types needed for the component
interface GoogleMap extends google.maps.Map {
  setOptions(options: GoogleMapOptions): void;
}

interface GoogleMapOptions {
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  gestureHandling?: string;
}

interface GoogleMapsWindow extends Window {
  google: {
    maps: typeof google.maps;
  };
}

export default function Map({ venues }: MapProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function initializeMap() {
      try {
        // Fetch API key securely from backend
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
      const googleWindow = window as unknown as GoogleMapsWindow;
      mapRef.current = new googleWindow.google.maps.Map(
        containerRef.current,
        {
          center: CAPE_TOWN_COORDS,
          zoom: 11,
          gestureHandling: "cooperative",
        }
      );

      // Add markers
      venues?.forEach((venue) => {
        new googleWindow.google.maps.Marker({
          position: venue.location,
          map: mapRef.current!,
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
