import { NextResponse } from "next/server";
import { Venue } from "@/types/venue";
import {
  CAPE_TOWN_COORDS,
  VENUE_TYPES,
  VenueType,
} from "@/lib/googlePlaces";

interface PlacesApiError {
  error: string;
}

interface PlaceDetails {
  result: {
    name: string;
    rating?: number;
    photos?: Array<{ photo_reference: string }>;
    vicinity?: string;
    website?: string;
    formatted_address?: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    editorial_summary?: {
      overview: string;
    };
    opening_hours?: {
      weekday_text: string[];
      open_now?: boolean;
    };
  };
}

interface PlacesResponse {
  results: Array<{
    name: string;
    place_id: string;
    rating?: number;
    photos?: Array<{
      photo_reference: string;
    }>;
    vicinity?: string;
    website?: string;
    formatted_address?: string;
  }>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");
    const type = typeParam as VenueType;

    if (!type || !VENUE_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Invalid venue type" } as PlacesApiError,
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Maps API key not configured");
    }

    // First request to get places
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${CAPE_TOWN_COORDS.lat},${CAPE_TOWN_COORDS.lng}&radius=20000&type=${type}&key=${apiKey}&maxresults=5`
    );

    const placesData =
      (await placesResponse.json()) as PlacesResponse;

    // Process venues
    const venues: Venue[] = await Promise.all(
      placesData.results.map(async (place) => {
        // Get place details
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,photos,vicinity,website,formatted_address,geometry,editorial_summary,opening_hours&key=${apiKey}`
        );

        const detailsData =
          (await detailsResponse.json()) as PlaceDetails;
        const details = detailsData.result;

        return {
          id: place.place_id,
          name: place.name,
          rating: place.rating || 0,
          photos: (place.photos || []).map((photo) => ({
            reference: photo.photo_reference,
            url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${apiKey}`,
          })),
          district: place.vicinity || "",
          website: details.website || "",
          googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
          location: {
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng,
          },
          address: details.formatted_address || "",
          about:
            details.editorial_summary?.overview ||
            "No description available",
          opening_hours: {
            hours: details.opening_hours?.weekday_text || [],
            open_now: details.opening_hours?.open_now || false,
          },
          labels: [
            details.opening_hours?.open_now ? "Open now" : "Closed",
          ],
        };
      })
    );

    return NextResponse.json(venues);
  } catch (error: unknown) {
    console.error("Venues API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch venues" } as PlacesApiError,
      { status: 500 }
    );
  }
}
