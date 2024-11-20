declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element | null, opts?: MapOptions);
    setOptions(options: MapOptions): void;
    getDiv(): Element;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    gestureHandling?: string;
    disableDefaultUI?: boolean;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
  }

  interface LatLng {
    lat(): number;
    lng(): number;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }
}

declare global {
  interface Window {
    google: typeof google;
  }
}

export {};
