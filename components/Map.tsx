"use client";

import {
  useLoadScript,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";
import { Venue } from "@/types/venue";
import { CAPE_TOWN_COORDS } from "@/lib/googlePlaces";

interface MapProps {
  venues: Venue[];
}

export default function Map({ venues }: MapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "400px" }}
      center={CAPE_TOWN_COORDS}
      zoom={11}
    >
      {venues.map((venue) => (
        <Marker
          key={venue.id}
          position={venue.location}
          title={venue.name}
        />
      ))}
    </GoogleMap>
  );
}
