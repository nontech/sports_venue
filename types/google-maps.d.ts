declare namespace google.maps {
  interface PlaceResult {
    place_id?: string;
    name?: string;
    rating?: number;
    photos?: google.maps.places.PlacePhoto[];
    vicinity?: string;
    website?: string;
    formatted_address?: string;
    geometry?: {
      location: google.maps.LatLng;
    };
    opening_hours?: {
      weekday_text?: string[];
      isOpen?: () => boolean;
    };
  }

  interface LatLng {
    lat(): number;
    lng(): number;
  }

  namespace places {
    interface PlacePhoto {
      getUrl(opts: { maxWidth: number }): string;
    }

    interface PlacesService {
      nearbySearch(
        request: {
          location: { lat: number; lng: number };
          radius: number;
          type: string;
        },
        callback: (
          results: PlaceResult[] | null,
          status: PlacesServiceStatus,
          pagination: PlaceSearchPagination | null
        ) => void
      ): void;

      getDetails(
        request: {
          placeId: string;
          fields: string[];
        },
        callback: (
          result: google.maps.PlaceResult,
          status: google.maps.places.PlacesServiceStatus
        ) => void
      ): void;
    }

    enum PlacesServiceStatus {
      OK = "OK",
      ZERO_RESULTS = "ZERO_RESULTS",
      INVALID_REQUEST = "INVALID_REQUEST",
      OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
      REQUEST_DENIED = "REQUEST_DENIED",
      ERROR = "ERROR",
    }

    interface PlaceSearchPagination {
      hasNextPage: boolean;
      nextPage(): void;
    }
  }
}

declare global {
  interface Window {
    google: typeof google;
  }
}

export {};
