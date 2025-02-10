"use client";

import { SWRResponse } from "swr";
import useSWRImmutable from "swr/immutable";
import { TwitterProfile } from "@/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

export function useTwitterProfile(handle: string) {
  const { data, error, isLoading }: SWRResponse<TwitterProfile, Error> =
    useSWRImmutable(`/api/twitter/${handle}`, fetcher);

  return {
    profileUrl: data?.profile_image_url,
    isLoading,
    error,
  };
}
