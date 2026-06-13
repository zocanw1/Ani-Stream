import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAnimeNotFoundResponse } from "@/lib/anime-response";
import OtakudesuDetailClient, { OtakudesuDetail } from "./OtakudesuDetailClient";

// Helper to fetch data on server
async function getOtakudesuDetail(slug: string): Promise<OtakudesuDetail | null> {
  const res = await fetch(`https://www.sankavollerei.com/anime/anime/${slug}`, {
    next: { revalidate: 3600 }
  });
  const json = await res.json().catch(() => null) as { data?: OtakudesuDetail | null } | null;
  if (isAnimeNotFoundResponse(json)) return null;
  if (!res.ok) {
    if (res.status >= 400 && res.status < 500) return null;
    throw new Error(`Otakudesu anime API gagal dengan status ${res.status}`);
  }
  return json?.data || null;
}

// Generate Dynamic Metadata for SEO (Next.js 15+ needs await params)
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const data = await getOtakudesuDetail(params.slug);
  
  if (!data) {
    return {
      title: "Anime Tidak Ditemukan — AniStream",
    };
  }

  return {
    title: `Nonton ${data.title} Sub Indo — AniStream`,
    description: `Streaming dan download ${data.title} subtitle Indonesia kualitas terbaik di AniStream. Nikmati layanan streaming anime tercepat.`,
    openGraph: {
      title: data.title,
      description: `Nonton ${data.title} di AniStream (Otakudesu)`,
      images: [{ url: data.poster }],
    },
  };
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const data = await getOtakudesuDetail(params.slug);

  if (!data) {
    notFound();
  }

  return <OtakudesuDetailClient data={data} />;
}
