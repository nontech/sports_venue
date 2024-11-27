"use client";

import { useEffect, useState } from "react";
import VenuesTable from "@/components/VenuesTable";
import MapClient from "@/components/MapClient";
import { Venue } from "@/types/venue";
import {
  VenueType,
  VENUE_TYPES,
  CAPE_TOWN_COORDS,
} from "@/lib/googlePlaces";
import { scriptLoader } from "@/utils/scriptLoader";

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function VenuesContent() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<VenueType>("gym");

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error("Google Maps API key is not configured");
        }

        // Load Google Maps script
        await scriptLoader.loadScript(
          `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        );

        // Create a dummy map (required for PlacesService)
        const map = new window.google.maps.Map(
          document.createElement("div")
        );
        const service = new window.google.maps.places.PlacesService(
          map
        );

        // Search for places
        const placesResults = await new Promise<
          google.maps.places.PlaceResult[]
        >((resolve, reject) => {
          service.nearbySearch(
            {
              location: CAPE_TOWN_COORDS,
              radius: 20000,
              type: selectedType.toLowerCase(),
            },
            (
              results: google.maps.places.PlaceResult[] | null,
              status: google.maps.places.PlacesServiceStatus,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              _pagination: google.maps.places.PlaceSearchPagination | null
            ) => {
              if (
                status ===
                  google.maps.places.PlacesServiceStatus.OK &&
                results
              ) {
                resolve(results);
              } else {
                reject(new Error(`Places API error: ${status}`));
              }
            }
          );
        });

        const limitedResults = placesResults.slice(0, 5);

        // Get details for each place
        const venuesWithDetails = await Promise.all(
          limitedResults.map(async (place) => {
            const placeId = place.place_id;
            if (!placeId) {
              throw new Error("Place ID is missing");
            }

            const details =
              await new Promise<google.maps.places.PlaceResult>(
                (resolve, reject) => {
                  service.getDetails(
                    {
                      placeId,
                      fields: [
                        "name",
                        "rating",
                        "photos",
                        "vicinity",
                        "website",
                        "formatted_address",
                        "geometry",
                        "opening_hours",
                      ],
                    },
                    (
                      result: google.maps.places.PlaceResult | null,
                      status: google.maps.places.PlacesServiceStatus
                    ) => {
                      if (
                        status ===
                          google.maps.places.PlacesServiceStatus.OK &&
                        result
                      ) {
                        resolve(result);
                      } else {
                        reject(
                          new Error(
                            `Place Details API error: ${status}`
                          )
                        );
                      }
                    }
                  );
                }
              );

            return {
              id: placeId,
              name: place.name || "Unknown Venue",
              rating: place.rating || 0,
              photos: (place.photos || []).map(
                (photo: google.maps.places.PlacePhoto) => ({
                  reference: "",
                  url: photo.getUrl({ maxWidth: 400 }) || "",
                })
              ),
              district: place.vicinity || "",
              website: details.website || "",
              googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
              location: {
                lat: details.geometry?.location?.lat() || 0,
                lng: details.geometry?.location?.lng() || 0,
              },
              address: details.formatted_address || "",
              about: "No description available",
              opening_hours: {
                hours: details.opening_hours?.weekday_text || [],
              },
              labels: [
                details.opening_hours?.isOpen?.()
                  ? "Open now"
                  : "Closed",
              ],
            };
          })
        );

        setVenues(venuesWithDetails);
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
    <div>
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
          className="block w-full md:w-64 px-4 py-2 text-black border border-gray-300 
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
            <MapClient
              venues={venues}
              apiKey={
                process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
              }
            />
          </div>
          <VenuesTable venues={venues} />
        </>
      )}
    </div>
  );
}
