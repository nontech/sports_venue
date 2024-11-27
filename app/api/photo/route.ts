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
    if (!response.ok) {
      throw new Error(
        `Failed to fetch photo: ${response.statusText}`
      );
    }

    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": "attachment",
      },
    });
  } catch (error) {
    console.error("Photo fetch error:", error);
    return new NextResponse("Failed to fetch photo", {
      status: 500,
    });
  }
}
