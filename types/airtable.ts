export interface AirtableVenue {
  "Venue Name": string;
  District: string;
  "Google Rating": number | null;
  "Website Link": string | null;
  "Google Maps Link": string | null;
  About: string | null;
  Photos: {
    url: string;
    filename: string;
  }[];
}
