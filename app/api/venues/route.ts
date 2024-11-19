import { NextResponse } from "next/server";
import { CAPE_TOWN_COORDS, SEARCH_RADIUS } from "@/lib/googlePlaces";

async function getPlaceDetails(placeId: string, apiKey: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,url,website,formatted_address,photos,editorial_summary&key=${apiKey}`,
    { cache: "no-store" }
  );
  return response.json();
}

function extractDistrict(address: string): string {
  // Remove ", South Africa" if present
  address = address.replace(/, South Africa$/, "");

  // Split by comma and look for the part before "Cape Town"
  const parts = address.split(",").map((part) => part.trim());

  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i].includes("Cape Town")) {
      return parts[i - 1] || "Cape Town"; // Return the part before "Cape Town" or "Cape Town" if not found
    }
  }

  // If no "Cape Town" is found, return the last part before the last comma
  return (
    parts[parts.length - 2] || parts[parts.length - 1] || "Cape Town"
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "gym";
  const location = `${CAPE_TOWN_COORDS.lat},${CAPE_TOWN_COORDS.lng}`;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY!;

  try {
    // First API call to get basic venue info
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${SEARCH_RADIUS}&type=${type}&keyword=sports&key=${apiKey}&maxResults=3`,
      { cache: "no-store" }
    );

    const data = await response.json();
    const limitedResults = data.results.slice(0, 3);

    // Get detailed information for each venue
    const venuesWithDetails = await Promise.all(
      limitedResults.map(async (result: any) => {
        const details = await getPlaceDetails(
          result.place_id,
          apiKey
        );

        return {
          id: result.place_id,
          name: result.name,
          rating: result.rating || null,
          googleMapsUrl: details.result.url || null,
          website: details.result.website || null,
          district: extractDistrict(result.vicinity),
          photos:
            details.result.photos?.map((photo: any) => ({
              reference: photo.photo_reference,
              url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${apiKey}`,
            })) || [],
          about: details.result.editorial_summary?.overview || null,
          address: result.vicinity,
          location: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
          },
        };
      })
    );

    return NextResponse.json(venuesWithDetails);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    );
  }
}
