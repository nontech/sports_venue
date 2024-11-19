import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const photoUrl = searchParams.get("url");

    if (!photoUrl) {
      return new NextResponse("Photo URL is required", {
        status: 400,
      });
    }

    const response = await fetch(photoUrl);
    const blob = await response.blob();

    // Set appropriate headers for image download
    const headers = new Headers();
    headers.set("Content-Type", "image/jpeg");
    headers.set("Content-Disposition", "attachment");

    return new NextResponse(blob, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error("Photo download error:", error);
    return new NextResponse("Failed to download photo", {
      status: 500,
    });
  }
}
