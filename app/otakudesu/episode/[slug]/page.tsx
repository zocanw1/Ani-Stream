import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAnimeNotFoundResponse } from "@/lib/anime-response";
import OtakudesuEpisodeClient, { EpisodeData } from "./OtakudesuEpisodeClient";

// Helper to fetch data on server
async function getEpisodeData(slug: string): Promise<EpisodeData | null> {
  const res = await fetch(`https://www.sankavollerei.com/anime/episode/${slug}`, {
    next: { revalidate: 3600 }
  });
  const json = await res.json().catch(() => null) as { data?: EpisodeData | null } | null;
  if (isAnimeNotFoundResponse(json)) return null;
  if (!res.ok) {
    if (res.status >= 400 && res.status < 500) return null;
    throw new Error(`Otakudesu episode API gagal dengan status ${res.status}`);
  }
  return json?.data || null;
}

// Generate Dynamic Metadata for SEO (Next.js 15+ needs await params)
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const data = await getEpisodeData(params.slug);
  
  if (!data) {
    return {
      title: "Episode Tidak Ditemukan — AniStream",
    };
  }

  return {
    title: `Nonton ${data.title} Sub Indo — AniStream`,
    description: `Nonton streaming online ${data.title} subtitle Indonesia kualitas terbaik (SD, HD, Full HD) di AniStream. Layanan streaming anime tercepat dan terlengkap.`,
    openGraph: {
      title: data.title,
      description: `Streaming ${data.title} di AniStream (Otakudesu)`,
      images: [{ url: data.defaultStreamingUrl ? "" : "" }], // Default placeholder if needed
    },
  };
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const data = await getEpisodeData(params.slug);

  if (!data) {
    notFound();
  }

  return <OtakudesuEpisodeClient initialData={data} slug={params.slug} />;
}
