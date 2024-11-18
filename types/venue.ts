export interface Venue {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  types: string[];
  photos?: string[];
  website?: string;
  vicinity: string;
  place_id: string;
}
