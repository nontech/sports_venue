"use client";

import { Venue } from "@/types/venue";
import { AirtableVenue } from "@/types/airtable";
import { transformVenueForAirtable } from "@/utils/airtableTransform";
import { downloadAirtableCSV } from "@/utils/exportToAirtable";
import Image from "next/image";
import { extractDistrict } from "@/utils/addressUtils";

interface VenuesTableProps {
  venues: Venue[];
  category: string;
}

export default function VenuesTable({
  venues,
  category,
}: VenuesTableProps) {
  const handlePhotoDownload = async (
    url: string,
    venueName: string,
    index: number
  ) => {
    try {
      // Show loading state
      const button = document.getElementById(`download-btn-${index}`);
      if (button) button.textContent = "Downloading...";

      // Create filename
      const filename = `${venueName
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_photo_${index + 1}.jpg`;

      // Use our proxy endpoint
      const response = await fetch(
        `/api/photo?url=${encodeURIComponent(url)}`
      );

      if (!response.ok) {
        throw new Error("Failed to download photo");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create and trigger download link
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(downloadUrl);

      // Reset button text
      if (button) button.textContent = "⬇️ Download";
    } catch (error) {
      console.error("Error downloading photo:", error);
      const button = document.getElementById(`download-btn-${index}`);
      if (button) {
        button.textContent = "Error";
        setTimeout(() => {
          button.textContent = "⬇️ Download";
        }, 2000);
      }
    }
  };

  const handleExportToAirtable = () => {
    const airtableData = venues.map(transformVenueForAirtable);
    downloadAirtableCSV(airtableData as AirtableVenue[]);
  };

  if (!venues.length) {
    return <div>No venues found</div>;
  }

  return (
    <div>
      <div className="max-w-[100vw] overflow-x-auto">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleExportToAirtable}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 
                     transition-colors flex items-center gap-2"
          >
            <span>Airtable Export</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        </div>

        <div className="shadow-sm border rounded-lg overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[50px]"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]"
                >
                  Photos
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[180px]"
                >
                  Venue Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[300px]"
                >
                  District
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]"
                >
                  Latitude
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]"
                >
                  Longitude
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]"
                >
                  Google Rating
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-1"
                >
                  Website Link
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-1"
                >
                  Google Maps Link
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-1"
                >
                  About
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-1"
                >
                  Opening Hours
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {venues.map((venue, index) => (
                <tr
                  key={`${venue.id}_${index}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {venue.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="relative group flex-shrink-0"
                        >
                          <div className="w-40 h-32 relative">
                            <Image
                              src={photo.url}
                              alt={`${venue.name} photo ${index + 1}`}
                              fill
                              className="object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                          <button
                            id={`download-btn-${index}`}
                            onClick={() =>
                              handlePhotoDownload(
                                photo.url,
                                venue.name,
                                index
                              )
                            }
                            className="absolute inset-0 bg-black bg-opacity-50 text-white 
                                     opacity-0 group-hover:opacity-100 transition-opacity
                                     flex flex-col items-center justify-center text-sm rounded-lg"
                          >
                            <span className="text-2xl mb-1">⬇️</span>
                            <span className="text-xs">Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {venue.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {extractDistrict(venue.address)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {venue.location.lat.toFixed(6)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {venue.location.lng.toFixed(6)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {venue.rating ? (
                      <div className="text-sm text-gray-900">
                        {venue.rating.toFixed(1)}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        No rating
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {venue.website && (
                      <a
                        href={venue.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        {venue.website}
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 w-[200px]">
                    {venue.googleMapsUrl && (
                      <a
                        href={venue.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        {venue.googleMapsUrl}
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {venue.about}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[300px]">
                      {venue.opening_hours?.hours.map(
                        (hour: string, index: number) => (
                          <div
                            key={index}
                            className="text-sm text-black"
                          >
                            {hour}
                          </div>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
