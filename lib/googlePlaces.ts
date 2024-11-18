export const CAPE_TOWN_COORDS = {
  lat: -33.9249,
  lng: 18.4241,
};

export const SEARCH_RADIUS = 50000; // 50km in meters

export const VENUE_TYPES = [
  "gym",
  "stadium",
  "sports_complex",
] as const;

export type VenueType = (typeof VENUE_TYPES)[number];
