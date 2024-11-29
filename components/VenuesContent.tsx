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

interface CachedVenues {
  [category: string]: {
    venues: Venue[];
    lastUpdated: Date;
  };
}

interface PlacesResponse {
  results: google.maps.places.PlaceResult[];
  next_page_token?: string;
}

interface ExtendedTextSearchRequest
  extends google.maps.places.TextSearchRequest {
  pageToken?: string;
}

export default function VenuesContent() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("Gym");
  const [cachedVenues, setCachedVenues] = useState<CachedVenues>({});

  const currentCategoryCount =
    venues.length || // Use current venues length if available
    cachedVenues[selectedType]?.venues.length || // Fallback to cached venues
    0; // Default to 0 if neither is available

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchVenues = async () => {
      if (cachedVenues[selectedType]?.venues) {
        setVenues(cachedVenues[selectedType].venues);
        setIsInitialLoading(false);
        return;
      }

      try {
        setIsInitialLoading(true);
        setError(null);
        setVenues([]);

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

        // Function to fetch a page of results
        const fetchPage = async (
          pageToken?: string
        ): Promise<PlacesResponse> => {
          return new Promise((resolve, reject) => {
            const request: ExtendedTextSearchRequest = {
              query: categoryQueries[selectedType] || selectedType,
              location: CAPE_TOWN_COORDS,
              radius: SEARCH_RADIUS,
            };

            if (pageToken) {
              request.pageToken = pageToken;
            }

            service.textSearch(
              request,
              (results, status, pagination) => {
                if (
                  status ===
                    google.maps.places.PlacesServiceStatus.OK &&
                  results
                ) {
                  resolve({
                    results,
                    next_page_token: pagination?.hasNextPage
                      ? "next-page"
                      : undefined,
                  });
                } else {
                  reject(new Error(`Places API error: ${status}`));
                }
              }
            );
          });
        };

        let allResults: google.maps.places.PlaceResult[] = [];
        let nextPageToken: string | undefined;
        const uniqueVenues = new Map<string, Venue>();

        // Process venues in smaller batches
        const processVenueDetails = async (
          places: google.maps.places.PlaceResult[]
        ) => {
          const batchSize = 5;

          for (let i = 0; i < places.length; i += batchSize) {
            if (!isMounted) return;

            const batch = places.slice(i, i + batchSize);
            const detailedVenues = await Promise.all(
              batch.map(async (place) => {
                const placeId = place.place_id;
                if (!placeId) return null;

                try {
                  const details =
                    await new Promise<google.maps.places.PlaceResult>(
                      (resolve, reject) => {
                        service.getDetails(
                          {
                            placeId,
                            fields: [
                              "website",
                              "formatted_address",
                              "opening_hours",
                            ],
                          },
                          (result, status) => {
                            if (
                              status ===
                                google.maps.places.PlacesServiceStatus
                                  .OK &&
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
                    photos: (place.photos || []).map((photo) => ({
                      reference: "",
                      url: photo.getUrl?.({ maxWidth: 400 }) || "",
                    })),
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
                      hours:
                        details.opening_hours?.weekday_text || [],
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

            if (!isMounted) return;

            const validVenues = detailedVenues.filter(
              (v): v is Venue => v !== null
            );

            validVenues.forEach((venue) =>
              uniqueVenues.set(venue.id, venue)
            );

            const currentVenues = Array.from(uniqueVenues.values());
            setVenues(currentVenues);
          }
        };

        do {
          if (!isMounted) return;

          if (nextPageToken) {
            setLoadingMore(true);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }

          const response = await fetchPage(nextPageToken);
          allResults = [...allResults, ...response.results];
          nextPageToken = response.next_page_token;

          await processVenueDetails(response.results);
          setLoadingMore(false);
        } while (nextPageToken && isMounted);

        if (isMounted) {
          const finalVenues = Array.from(uniqueVenues.values());
          setCachedVenues((prev) => ({
            ...prev,
            [selectedType]: {
              venues: finalVenues,
              lastUpdated: new Date(),
            },
          }));
        }
      } catch (err) {
        if (isMounted) {
          console.error("Fetch error:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong"
          );
        }
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchVenues();

    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
      setVenues([]);
    };
  }, [selectedType]);

  return (
    <div>
      <div className="mb-6">
        <label
          htmlFor="venue-type"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Venue Type ({currentCategoryCount} venues)
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
          <VenuesTable venues={venues} category={selectedType} />
          {loadingMore && (
            <div className="text-center mt-4 text-gray-600">
              Loading more venues...
            </div>
          )}
        </>
      )}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
