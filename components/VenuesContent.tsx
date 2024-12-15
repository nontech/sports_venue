"use client";

import { useEffect, useState } from "react";
import VenuesTable from "@/components/VenuesTable";
import MapClient from "@/components/MapClient";
import { Venue } from "@/types/venue";
import {
  CAPE_TOWN_COORDS,
  SEARCH_RADIUS,
  categoryQueries,
} from "@/lib/googlePlaces";
import { scriptLoader } from "@/utils/scriptLoader";

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function VenuesContent() {
  // State for venues
  const [venues, setVenues] = useState<Venue[]>([]);

  // State for loading and error
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for selected venue type
  const [selectedType, setSelectedType] = useState<string>("gym");

  const currentCategoryCount = venues.length || 0;

  // Add new state for tracking loading count
  const [loadingCount, setLoadingCount] = useState(0);

  // Process venues in smaller batches
  const processVenueDetails = async (
    places: google.maps.places.PlaceResult[],
    placeService: google.maps.places.PlacesService
  ): Promise<Venue[]> => {
    if (!placeService) return [];

    const processedVenues: Venue[] = [];
    const batchSize = 5;

    for (let i = 0; i < places.length; i += batchSize) {
      const batch = places.slice(i, i + batchSize);
      const detailedVenues = await Promise.all(
        batch.map(async (place) => {
          const placeId = place.place_id;
          if (!placeId) return null;

          try {
            const details =
              await new Promise<google.maps.places.PlaceResult>(
                (resolve, reject) => {
                  placeService.getDetails(
                    {
                      placeId,
                      fields: [
                        "website",
                        "formatted_address",
                        "opening_hours",
                        "photo",
                      ],
                    },
                    (result, status) => {
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

            // Return the venue object
            return {
              id: placeId,
              name: place.name || "Unknown Venue",
              rating: place.rating || 0,
              photos: [
                // Get all photos from place
                ...(place.photos || []).map((photo) => ({
                  reference: "",
                  url: `/api/photo?url=${encodeURIComponent(
                    photo.getUrl?.({ maxWidth: 800 }) || ""
                  )}`,
                })),
                // Get all photos from details
                ...(details.photos || []).map((photo) => ({
                  reference: "",
                  url: `/api/photo?url=${encodeURIComponent(
                    photo.getUrl?.({ maxWidth: 800 }) || ""
                  )}`,
                })),
              ].filter(
                // Remove duplicates based on URL
                (photo, index, self) =>
                  index === self.findIndex((p) => p.url === photo.url)
              ),
              district: place.vicinity || "",
              website: details.website || "",
              googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0,
              },
              address:
                details.formatted_address ||
                place.formatted_address ||
                "",
              about: "No description available",
              opening_hours: {
                hours: details.opening_hours?.weekday_text || [],
              },
              labels: [
                details.opening_hours?.isOpen?.()
                  ? "Open now"
                  : "Closed",
              ],
              category: selectedType,
            };
          } catch (error) {
            console.error(
              `Error fetching details for ${place.name}:`,
              error
            );
            return null;
          }
        })
      );

      // Filter out null venues
      const validVenues = detailedVenues.filter(
        (v): v is Venue => v !== null
      );
      // Add valid venues to the processedVenues array
      processedVenues.push(...validVenues);
    }
    // Return the processed venues
    return processedVenues;
  };

  // Fetch all venues
  const fetchAllVenues = async (
    placeService: google.maps.places.PlacesService
  ) => {
    if (!placeService)
      throw new Error("Places service not initialized");

    return new Promise<google.maps.places.PlaceResult[]>(
      (resolve) => {
        let allResults: google.maps.places.PlaceResult[] = [];

        function searchCallback(
          results: google.maps.places.PlaceResult[] | null,
          status: google.maps.places.PlacesServiceStatus,
          pagination: google.maps.places.PlaceSearchPagination | null
        ) {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            results
          ) {
            // Add the current results
            allResults = [...allResults, ...results];

            // Update the loading count
            setLoadingCount(allResults.length);
            console.log(
              `Got ${results.length} results, total now: ${allResults.length}`
            );

            // If we have more pages and haven't hit 60 results yet
            if (pagination?.hasNextPage && allResults.length < 60) {
              // Wait 2 seconds before requesting next page
              setTimeout(() => {
                pagination.nextPage();
              }, 2000);
            } else {
              // No more results or hit limit, resolve with what we have
              resolve(allResults);
            }
          } else {
            // Error or no results, resolve with what we have
            resolve(allResults);
          }
        }

        const request: google.maps.places.TextSearchRequest = {
          query: categoryQueries[selectedType] || selectedType,
          location: CAPE_TOWN_COORDS,
          radius: SEARCH_RADIUS,
          type:
            selectedType.toLowerCase() === "gym" ? "gym" : undefined,
        };

        placeService.textSearch(request, searchCallback);
      }
    );
  };

  // Update the initial load effect
  useEffect(() => {
    let isMounted = true;

    const loadVenues = async () => {
      try {
        setIsInitialLoading(true);
        setError(null);

        await scriptLoader.loadScript(
          `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        );

        const map = new window.google.maps.Map(
          document.createElement("div")
        );
        const placeService =
          new window.google.maps.places.PlacesService(map);

        const results = await fetchAllVenues(placeService);
        const processedVenues = await processVenueDetails(
          results,
          placeService
        );

        if (isMounted) {
          setVenues(processedVenues || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong"
          );
        }
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    };

    loadVenues();
    return () => {
      isMounted = false;
    };
  }, [selectedType]);

  return (
    <div>
      <div className="mb-6">
        <label
          htmlFor="venue-type"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Venue Type (
          {isInitialLoading
            ? `Loading (${loadingCount})...`
            : `${currentCategoryCount} venues`}
          )
        </label>
        <select
          id="venue-type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="block w-full md:w-64 px-4 py-2 text-black border border-gray-300 
                   rounded-md shadow-sm focus:outline-none focus:ring-2 
                   focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          {Object.keys(categoryQueries).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {isInitialLoading && venues.length === 0 ? (
        <div className="text-center">Loading venues...</div>
      ) : (
        <>
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <MapClient
              venues={venues}
              apiKey={
                process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
              }
            />
          </div>
          <VenuesTable
            venues={[...venues].sort((a, b) =>
              a.name.localeCompare(b.name)
            )}
          />
        </>
      )}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
