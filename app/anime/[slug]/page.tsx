import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import AnimeDetailClient, { AnimeDetail } from "./AnimeDetailClient";

// Helper to fetch data on server
async function getAnimeDetail(slug: string): Promise<AnimeDetail | null> {
  const res = await fetch(`https://www.sankavollerei.com/anime/samehadaku/anime/${slug}`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) {
    if (res.status >= 400 && res.status < 500) return null;
    throw new Error(`Samehadaku anime API gagal dengan status ${res.status}`);
  }
  const json = await res.json();
  return json.data || null;
}

// Generate Dynamic Metadata for SEO (Next.js 15+ needs await params)
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const data = await getAnimeDetail(params.slug);
  
  if (!data) {
    return {
      title: "Anime Tidak Ditemukan — AniStream",
    };
  }

  return {
    title: `Nonton ${data.title} Sub Indo — AniStream`,
    description: `Streaming dan download ${data.title} subtitle Indonesia. ${data.synopsis && typeof data.synopsis === 'string' ? data.synopsis.slice(0, 160) : data.title + ' lengkap di AniStream'}...`,
    openGraph: {
      title: data.title,
      description: `Nonton ${data.title} di AniStream`,
      images: [{ url: data.poster }],
    },
  };
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const data = await getAnimeDetail(params.slug);

  if (!data) {
    notFound();
  }

  return <AnimeDetailClient data={data} slug={params.slug} />;
}
