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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {venues.map((venue) => (
        <div
          key={venue.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Photo */}
          <div className="relative h-48 w-full">
            {venue.photos && venue.photos[0] ? (
              <img
                src={venue.photos[0].url}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                No Image Available
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <dl className="space-y-4">
              {/* Venue Name */}
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Venue Name
                </dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {venue.name}
                </dd>
              </div>

              {/* District */}
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  District
                </dt>
                <dd className="mt-1 text-gray-900">
                  {venue.district}
                </dd>
              </div>

              {/* Rating */}
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Google Rating
                </dt>
                <dd className="mt-1">
                  {venue.rating ? (
                    <div className="flex items-center">
                      <span className="text-yellow-400">
                        {"★".repeat(Math.round(venue.rating))}
                      </span>
                      <span className="ml-1 text-gray-900">
                        ({venue.rating})
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">
                      No rating available
                    </span>
                  )}
                </dd>
              </div>

              {/* Website */}
              {venue.website && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Website Link
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={venue.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 text-sm break-all"
                    >
                      {venue.website}
                    </a>
                  </dd>
                </div>
              )}

              {/* Google Maps */}
              {venue.googleMapsUrl && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Google Maps Link
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={venue.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 text-sm break-all"
                    >
                      {venue.googleMapsUrl}
                    </a>
                  </dd>
                </div>
              )}

              {/* About */}
              {venue.about && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    About
                  </dt>
                  <dd className="mt-1 text-gray-900 text-sm">
                    {venue.about}
                  </dd>
                </div>
              )}

              {/* Photos Count */}
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Photos
                </dt>
                <dd className="mt-1 text-gray-900">
                  {venue.photos.length > 0
                    ? `${venue.photos.length} available`
                    : "No photos available"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ))}
    </div>
  );
}
