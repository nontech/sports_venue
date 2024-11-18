"use client";

import { Venue } from "@/types/venue";

interface VenuesTableProps {
  venues: Venue[];
}

export default function VenuesTable({ venues }: VenuesTableProps) {
  if (!venues.length) {
    return <div>No venues found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {venues.map((venue) => (
            <tr key={venue.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {venue.name}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500">
                  {venue.vicinity}
                </div>
                <div className="text-xs text-gray-400">
                  {venue.location.lat.toFixed(4)},{" "}
                  {venue.location.lng.toFixed(4)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-900">
                    {venue.rating ? (
                      <>
                        {venue.rating}{" "}
                        <span className="text-yellow-400">★</span>
                      </>
                    ) : (
                      "No rating"
                    )}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500">
                  {venue.types
                    .filter(
                      (type) =>
                        ![
                          "point_of_interest",
                          "establishment",
                        ].includes(type)
                    )
                    .map((type) => type.replace("_", " "))
                    .join(", ")}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
