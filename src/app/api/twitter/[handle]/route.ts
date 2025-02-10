import { NextRequest, NextResponse } from "next/server";
import { TwitterProfile } from "@/types";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const handle = url.pathname.split("/").pop() || "";

  if (!handle) {
    return NextResponse.json({ error: "Handle is required" }, { status: 400 });
  }

  try {
    const imageUrl = `https://unavatar.io/twitter/${handle}`;
    const response = await fetch(imageUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error("Failed to fetch avatar");
    }

    const profile: TwitterProfile = {
      profile_image_url: imageUrl,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching Twitter profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch Twitter profile" },
      { status: 500 }
    );
  }
}
