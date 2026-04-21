import React from "react";
import { Metadata } from "next";
import OtakudesuEpisodeClient, { EpisodeData } from "./OtakudesuEpisodeClient";

// Helper to fetch data on server
async function getEpisodeData(slug: string): Promise<EpisodeData | null> {
  try {
    const res = await fetch(`https://www.sankavollerei.com/anime/episode/${slug}`, {
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
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">Gagal Memuat Episode</h2>
          <p className="text-gray-400 text-sm mb-4">Maaf, episode Otakudesu dengan kode "{params.slug}" tidak ditemukan atau terjadi kesalahan server.</p>
          <a href="/otakudesu" className="btn-primary bg-[#ff7675] text-sm inline-block">Kembali ke Otakudesu</a>
        </div>
      </div>
    );
  }

  return <OtakudesuEpisodeClient initialData={data} slug={params.slug} />;
}
