import { Venue } from "@/types/venue";
import { extractDistrict } from "./addressUtils";
import { parseOpeningHours } from "@/utils/openingHoursUtils";

export function transformVenueForAirtable(venue: Venue) {
  const dailyHours = parseOpeningHours(venue.opening_hours.hours);

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
    Monday: dailyHours.Monday,
    Tuesday: dailyHours.Tuesday,
    Wednesday: dailyHours.Wednesday,
    Thursday: dailyHours.Thursday,
    Friday: dailyHours.Friday,
    Saturday: dailyHours.Saturday,
    Sunday: dailyHours.Sunday,
    Photos: [],
  };
}
