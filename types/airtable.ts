export interface AirtableVenue {
  "Venue Name": string;
  District: string;
  Latitude: number;
  Longitude: number;
  "Google Rating": number | null;
  "Website Link": string | null;
  "Google Maps Link": string | null;
  About: string | null;
  "Opening Hours": string;
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
  Photos: {
    url: string;
    filename: string;
  }[];
}
