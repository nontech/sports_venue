import { Venue } from "@/types/venue";
import { extractDistrict } from "./addressUtils";

export function transformVenueForAirtable(venue: Venue) {
  return {
    "Venue Name": venue.name,
    District: extractDistrict(venue.address),
    Latitude: venue.location.lat,
    Longitude: venue.location.lng,
    "Google Rating": venue.rating || "No rating",
    "Website Link": venue.website || "",
    "Google Maps Link": venue.googleMapsUrl || "",
    About: venue.about || "",
    "Opening Hours": venue.opening_hours?.hours?.join(", ") || "",
    Photos: venue.photos.map((photo, index) => ({
      url: photo.url,
      filename: `${venue.name.replace(/\s+/g, "_")}_photo_${
        index + 1
      }.jpg`,
    })),
  };
}
