import { headers } from "next/headers";
import MapClient from "./MapClient";
import { Venue } from "@/types/venue";

async function getGoogleMapsKey() {
  const host = headers().get("host");
  const protocol =
    process?.env.NODE_ENV === "development" ? "http" : "https";

  const response = await fetch(`${protocol}://${host}/api/map`, {
    cache: "force-cache",
  });
  const data = await response.json();
  return data.apiKey;
}

export default async function MapServer({
  venues,
}: {
  venues: Venue[];
}) {
  const apiKey = await getGoogleMapsKey();

  return <MapClient apiKey={apiKey} venues={venues} />;
}
