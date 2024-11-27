export function extractDistrict(address: string): string {
  // Handle empty or invalid addresses
  if (!address) return "Unknown District";

  // Split the address by commas
  const parts = address.split(",").map((part) => part.trim());

  // Find the index of "Cape Town"
  const capeTownIndex = parts.findIndex((part) =>
    part.includes("Cape Town")
  );

  // If we found Cape Town and there's a part before it, that's our district
  if (capeTownIndex > 0) {
    return parts[capeTownIndex - 1];
  }

  return "Unknown District";
}
