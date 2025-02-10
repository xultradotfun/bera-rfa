import { NextResponse } from "next/server";
import { TwitterProfile } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: { handle: string } }
) {
  const handle = params.handle;
  const imageUrl = `https://unavatar.io/twitter/${handle}`;

  try {
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
    return NextResponse.json(
      { error: "Failed to fetch Twitter profile" },
      { status: 500 }
    );
  }
}
