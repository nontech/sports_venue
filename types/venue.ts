export interface Venue {
  id: string;
  name: string;
  rating: number;
  photos: Array<{
    reference: string;
    url: string;
  }>;
  district: string;
  website: string;
  googleMapsUrl: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  about: string;
  opening_hours: {
    hours: string[];
  };
  labels: string[];
}
