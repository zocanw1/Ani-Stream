import React from "react";
import { Metadata } from "next";
import AnimeDetailClient, { AnimeDetail } from "./AnimeDetailClient";

// Helper to fetch data on server
async function getAnimeDetail(slug: string): Promise<AnimeDetail | null> {
  try {
    const res = await fetch(`https://www.sankavollerei.com/anime/samehadaku/anime/${slug}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    return null;
  }
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
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">Gagal Memuat Data</h2>
          <p className="text-gray-400 text-sm mb-4">Maaf, anime dengan kode "{params.slug}" tidak ditemukan atau terjadi kesalahan server.</p>
          <a href="/" className="btn-primary text-sm inline-block">Kembali ke Beranda</a>
        </div>
      </div>
    );
  }

  return <AnimeDetailClient data={data} slug={params.slug} />;
}
