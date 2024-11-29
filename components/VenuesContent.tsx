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

// interface CachedVenues {
//   [category: string]: {
//     venues: Venue[];
//     lastUpdated: Date;
//   };
// }

// interface PlacesResponse {
//   results: google.maps.places.PlaceResult[];
//   next_page_token?: string;
// }

interface ExtendedTextSearchRequest
  extends google.maps.places.TextSearchRequest {
  pageToken?: string;
}

// const wait = (ms: number) =>
//   new Promise((resolve) => setTimeout(resolve, ms));

export default function VenuesContent() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("Gym");
  // const [cachedVenues, setCachedVenues] = useState<CachedVenues>({});
  const [pageToken, setPageToken] = useState<string | undefined>();
  const [hasNextPage, setHasNextPage] = useState(false);
  const [service, setService] =
    useState<google.maps.places.PlacesService>();

  const currentCategoryCount = venues.length || 0;

  // Process venues in smaller batches
  const processVenueDetails = async (
    places: google.maps.places.PlaceResult[]
  ): Promise<Venue[]> => {
    if (!service) return [];

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
                  service.getDetails(
                    {
                      placeId,
                      fields: [
                        "website",
                        "formatted_address",
                        "opening_hours",
                        "photos",
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

            return {
              id: placeId,
              name: place.name || "Unknown Venue",
              rating: place.rating || 0,
              photos: [
                // Photos from initial search
                ...(place.photos || []).map((photo) => ({
                  reference: "",
                  url: photo.getUrl?.({ maxWidth: 800 }) || "",
                })),
                // Photos from details
                ...(details.photos || []).map((photo) => ({
                  reference: "",
                  url: photo.getUrl?.({ maxWidth: 800 }) || "",
                })),
              ].filter(
                (photo, index, self) =>
                  // Remove duplicates based on URL
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

      const validVenues = detailedVenues.filter(
        (v): v is Venue => v !== null
      );
      processedVenues.push(...validVenues);
    }

    return processedVenues;
  };

  // Function to fetch venues for a single page
  const fetchVenuePage = async (token?: string) => {
    if (!service) throw new Error("Places service not initialized");

    const request: ExtendedTextSearchRequest = {
      query: categoryQueries[selectedType] || selectedType,
      location: CAPE_TOWN_COORDS,
      radius: SEARCH_RADIUS,
      pageToken: token,
    };

    console.log("Fetching venues with token:", token);

    return new Promise<{
      results: google.maps.places.PlaceResult[];
      hasMore: boolean;
      nextToken?: string;
    }>((resolve, reject) => {
      service.textSearch(request, (results, status, pagination) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          results
        ) {
          console.log("Received results:", results.length);
          console.log("Has next page:", !!pagination?.hasNextPage);

          resolve({
            results,
            hasMore: !!pagination?.hasNextPage,
            nextToken: "next-page", // Keep this simple token
          });

          if (pagination?.hasNextPage) {
            pagination.nextPage();
          }
        } else {
          reject(new Error(`Places API error: ${status}`));
        }
      });
    });
  };

  // Effect to handle initial load and category changes
  /* eslint-disable-next-line react-hooks/exhaustive-deps -- 
     Intentionally omitting fetchVenuePage and processVenueDetails to prevent unnecessary rerenders 
  */
  useEffect(() => {
    let isMounted = true;

    const loadVenues = async () => {
      try {
        setIsInitialLoading(true);
        setError(null);
        setVenues([]);
        setPageToken(undefined);
        setHasNextPage(false);

        // Load Google Maps if needed
        await scriptLoader.loadScript(
          `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        );

        const map = new window.google.maps.Map(
          document.createElement("div")
        );
        const newService =
          new window.google.maps.places.PlacesService(map);
        setService(newService);

        // Fetch first page using the new service
        const { results, hasMore, nextToken } =
          await fetchVenuePage();
        const processedVenues = await processVenueDetails(results);

        if (isMounted) {
          // Ensure uniqueness when setting initial venues
          const uniqueVenues = new Map<string, Venue>();
          processedVenues?.forEach((venue) => {
            if (venue) uniqueVenues.set(venue.id, venue);
          });

          setVenues(Array.from(uniqueVenues.values()));
          setHasNextPage(hasMore);
          setPageToken(nextToken);
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

  // Effect to handle pagination
  /* eslint-disable-next-line react-hooks/exhaustive-deps -- 
     Intentionally omitting fetchVenuePage, loadingMore, and processVenueDetails to maintain current behavior 
  */
  useEffect(() => {
    let isMounted = true;

    const loadMoreVenues = async () => {
      if (!hasNextPage || !pageToken || loadingMore) return;

      try {
        console.log("Starting to fetch all venues...");
        setLoadingMore(true);

        // Temporary storage for all venues
        let allNewVenues: Venue[] = [];
        let shouldContinue = true;
        let pageCount = 0;

        // First, get all the venues
        while (shouldContinue && pageCount < 3 && isMounted) {
          console.log(`Fetching page ${pageCount + 1}...`);
          const { results, hasMore } = await fetchVenuePage(
            pageCount === 0 ? undefined : "next-page"
          );

          const processedVenues = await processVenueDetails(results);
          if (processedVenues) {
            allNewVenues = [...allNewVenues, ...processedVenues];
            console.log(
              `Accumulated ${allNewVenues.length} venues so far`
            );
          }

          shouldContinue = hasMore;
          pageCount++;
        }

        if (isMounted) {
          // Set all venues at once, no merging with previous
          setVenues(allNewVenues);
          console.log(`Final total venues: ${allNewVenues.length}`);

          // Reset pagination state
          setHasNextPage(false);
          setPageToken(undefined);
        }
      } catch (err) {
        console.error("Error loading venues:", err);
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong"
          );
        }
      } finally {
        if (isMounted) {
          setLoadingMore(false);
        }
      }
    };

    loadMoreVenues();
    return () => {
      isMounted = false;
    };
  }, [pageToken, hasNextPage]);

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
          <VenuesTable
            venues={[...venues].sort((a, b) =>
              a.name.localeCompare(b.name)
            )}
          />
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
