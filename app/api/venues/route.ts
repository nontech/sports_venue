import { NextResponse } from "next/server";
import { CAPE_TOWN_COORDS, SEARCH_RADIUS } from "@/lib/googlePlaces";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "gym";

  const location = `${CAPE_TOWN_COORDS.lat},${CAPE_TOWN_COORDS.lng}`;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${SEARCH_RADIUS}&type=${type}&keyword=sports&key=${process.env.GOOGLE_MAPS_API_KEY}&maxResults=3`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();

    if (data.status === "REQUEST_DENIED") {
      console.error("API Request Denied:", data.error_message);
      return NextResponse.json(
        { error: data.error_message },
        { status: 400 }
      );
    }

    const limitedResults = data.results.slice(0, 3);

    const venues = limitedResults.map((result: any) => ({
      id: result.place_id,
      name: result.name,
      address: result.vicinity,
      location: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      rating: result.rating || null,
      types: result.types || [],
      photos:
        result.photos?.map((photo: any) => photo.photo_reference) ||
        [],
      website: null,
      vicinity: result.vicinity,
      place_id: result.place_id,
    }));

    return NextResponse.json(venues);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    );
  }
}
