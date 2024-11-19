"use client";

import { useEffect, useState } from "react";
import VenuesTable from "@/components/VenuesTable";
import Map from "@/components/Map";
import { Venue } from "@/types/venue";
import { VenueType, VENUE_TYPES } from "@/lib/googlePlaces";
import ClientOnly from "./ClientOnly";

export default function VenuesContent() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<VenueType>("gym");

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/venues?type=${selectedType}`
        );
        if (!response.ok) throw new Error("Failed to fetch venues");
        const data = await response.json();
        setVenues(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [selectedType]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Sports Venues in Cape Town
      </h1>

      <ClientOnly>
        <div className="mb-6">
          <label
            htmlFor="venue-type"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Venue Type
          </label>
          <select
            id="venue-type"
            value={selectedType}
            onChange={(e) =>
              setSelectedType(e.target.value as VenueType)
            }
            className="block w-full md:w-64 px-4 py-2 text-base border border-gray-300 
                     rounded-md shadow-sm focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:border-blue-500 bg-white
                     capitalize"
          >
            {VENUE_TYPES.map((type) => (
              <option key={type} value={type} className="capitalize">
                {type.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="text-center">Loading venues...</div>
        )}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <>
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
              <Map venues={venues} />
            </div>
            <VenuesTable venues={venues} />
          </>
        )}
      </ClientOnly>
    </div>
  );
}
