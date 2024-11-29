import { AirtableVenue } from "@/types/airtable";
import { Venue } from "@/types/venue";

export function downloadAirtableCSV(venues: AirtableVenue[]) {
  // Define CSV headers
  const headers = [
    "Venue Name",
    "District",
    "Latitude",
    "Longitude",
    "Google Rating",
    "Website Link",
    "Google Maps Link",
    "About",
    "Opening Hours",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
    "Photos",
  ];

  // Convert venues to CSV rows
  const rows = venues.map((venue) => [
    venue["Venue Name"],
    venue["District"],
    venue["Latitude"],
    venue["Longitude"],
    venue["Google Rating"] || "",
    venue["Website Link"] || "",
    venue["Google Maps Link"] || "",
    venue["About"] || "",
    venue["Opening Hours"] || "",
    venue["Monday"] || "",
    venue["Tuesday"] || "",
    venue["Wednesday"] || "",
    venue["Thursday"] || "",
    venue["Friday"] || "",
    venue["Saturday"] || "",
    venue["Sunday"] || "",
    "",
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map(
          (cell) =>
            // Escape commas and quotes in cell content
            `"${String(cell).replace(/"/g, '""')}"`
        )
        .join(",")
    ),
  ].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `venues_export_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const exportToAirtable = async (
  category: string,
  venues: Venue[]
) => {
  // Only export venues from the specified category
  const categoryVenues = venues.filter(
    (venue) => venue.category === category
  );

  // ... existing export logic using categoryVenues ...
};
