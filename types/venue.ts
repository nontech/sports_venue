export interface Venue {
  id: string;
  name: string;
  rating: number | null;
  googleMapsUrl: string | null;
  website: string | null;
  district: string;
  photos: {
    reference: string;
    url: string;
  }[];
  about: string | null;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}
