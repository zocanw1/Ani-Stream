import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, SearchX, Star } from "lucide-react";
import { fetchAnimeApi } from "@/lib/anime-api";

export const revalidate = 1800;

type Genre = {
  title: string;
  genreId: string;
  href: string;
};

type SearchAnime = {
  title: string;
  poster: string;
  status: string;
  score: string;
  animeId: string;
  href: string;
  genreList: Genre[];
};

type SearchResponse = {
  data?: {
    animeList?: SearchAnime[];
  };
};

function cleanSlug(href: string) {
  return href.replace(/^\/anime\/anime\//, "").replace(/\/$/, "");
}

export default async function OtakudesuSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = String((await searchParams).q ?? "").trim().slice(0, 100);
  let results: SearchAnime[] | null = null;
  let error = "";

  if (query) {
    try {
      const response = await fetchAnimeApi<SearchResponse>(
        `/search/${encodeURIComponent(query)}`,
        revalidate,
      );
      results = response.data?.animeList ?? [];
    } catch {
      error = "Server pencarian Otakudesu sedang tidak dapat dihubungi.";
    }
  }

  return (
    <div className="min-h-screen px-4 pb-24 pt-12 sm:px-6 lg:px-8" style={{background: "var(--bg-deep)"}}>
      <div className="mx-auto max-w-7xl">
        {!query ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-gray-600">
              <SearchX size={38} aria-hidden="true" />
            </span>
            <h1 className="text-xl font-bold text-gray-300">Masukkan kata kunci pencarian</h1>
            <p className="mt-2 text-sm text-gray-600">Cari anime favoritmu di database Otakudesu.</p>
          </div>
        ) : (
          <div className="space-y-10 animate-fade-in">
            <header className="flex flex-col justify-between gap-6 border-b border-white/5 pb-8 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Hasil Pencarian <span className="text-gradient-anime">Otakudesu</span>
                </h1>
                <p className="mt-2 text-sm font-medium text-gray-500">
                  Menampilkan hasil untuk <strong className="font-black italic" style={{color: "var(--primary)"}}>&quot;{query}&quot;</strong>
                </p>
              </div>
              {results && (
                <span className="w-fit rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  {results.length} Anime Ditemukan
                </span>
              )}
            </header>

            {error && (
              <div role="alert" className="glass rounded-2xl border-red-500/20 p-12 text-center shadow-2xl">
                <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                  <AlertTriangle size={31} aria-hidden="true" />
                </span>
                <p className="font-bold text-red-400">Gagal memproses pencarian</p>
                <p className="mb-6 mt-1 text-sm text-gray-500">{error}</p>
                <a
                  href={`/otakudesu/search?q=${encodeURIComponent(query)}`}
                  className="btn-primary"
                >
                  Coba Lagi
                </a>
              </div>
            )}

            {!error && results && results.length > 0 && (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-8">
                {results.map((anime, index) => (
                  <Link
                    key={`${anime.animeId}-${index}`}
                    href={`/otakudesu/anime/${cleanSlug(anime.href)}`}
                    prefetch={false}
                    className="group block animate-fade-in-up"
                    style={{ animationDelay: `${(index % 10) * 0.05}s` }}
                  >
                    <div className="poster-card relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/5">
                      <Image
                        src={anime.poster}
                        alt={anime.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

                      {anime.score && anime.score !== "0" && anime.score !== "?" && (
                        <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg border border-white/20 px-2 py-1 text-[10px] font-black text-white shadow-xl" style={{background: "linear-gradient(135deg, var(--primary), var(--secondary))", boxShadow: "0 0 8px var(--primary-glow)"}}>
                          <Star size={11} fill="currentColor" aria-hidden="true" />
                          {anime.score}
                        </span>
                      )}

                      {anime.status && (
                        <span className={`absolute left-3 top-3 z-10 rounded-lg border border-white/10 px-2 py-1 text-[9px] font-black uppercase text-white shadow-lg ${
                          anime.status.toLowerCase().includes("ongoing") ? "bg-green-500" : "bg-blue-500"
                        }`}>
                          {anime.status}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <h2 className="line-clamp-2 text-sm font-black leading-snug text-gray-200 transition-colors group-hover:text-white">
                        {anime.title}
                      </h2>
                      <div className="flex flex-wrap gap-1.5">
                        {anime.genreList?.slice(0, 3).map((genre) => (
                          <span key={genre.genreId} className="rounded-md border border-white/5 bg-white/5 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                            {genre.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!error && results && results.length === 0 && (
              <div className="glass flex flex-col items-center justify-center rounded-3xl border-white/5 py-24 text-center shadow-2xl">
                <span className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 text-gray-600">
                  <SearchX size={45} aria-hidden="true" />
                </span>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">Tidak Ada Hasil</h2>
                <p className="mt-3 max-w-sm font-medium text-gray-500">
                  Anime <strong className="font-bold italic text-[#ff7675]">&quot;{query}&quot;</strong> tidak ditemukan. Coba kata kunci lain atau periksa ejaannya.
                </p>
                <Link href="/otakudesu" prefetch={false} className="btn-primary mt-10">
                  Kembali ke Beranda
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
