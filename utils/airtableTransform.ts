import { Venue } from "@/types/venue";
import { AirtableVenue } from "@/types/airtable";

export function transformVenueForAirtable(
  venue: Venue
): AirtableVenue {
  return {
    "Venue Name": venue.name,
    District: venue.district,
    "Google Rating": venue.rating,
    "Website Link": venue.website,
    "Google Maps Link": venue.googleMapsUrl,
    About: venue.about,
    Photos: venue.photos.map((photo, index) => ({
      url: photo.url,
      filename: `${venue.name.replace(/\s+/g, "_")}_photo_${
        index + 1
      }.jpg`,
    })),
  };
}
