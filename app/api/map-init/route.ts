import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Maps API key is not configured");
    }

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("Map initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize map" },
      { status: 500 }
    );
  }
}
