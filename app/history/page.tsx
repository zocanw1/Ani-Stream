import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAnimeHistory } from "@/lib/watch-history";

export const metadata = {
  title: "History Anime - AniStream",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/history");
  }

  const history = await getAnimeHistory(user.id);
  const featured = history[0];

  return (
    <div className="min-h-screen bg-[#050505] pb-20 text-white">
      <section className="relative overflow-hidden px-4 pb-14 pt-12 sm:px-6 lg:px-8">
        {featured?.poster_url && (
          <img src={featured.poster_url} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-sm" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 pt-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#E50914]">Watch History</p>
            <h1 className="mt-4 text-4xl font-black leading-none text-white sm:text-6xl">Continue Watching</h1>
            <p className="mt-4 max-w-2xl text-sm font-bold leading-7 text-neutral-300 sm:text-base">
              Satu episode terakhir dari setiap anime yang pernah kamu tonton.
            </p>
          </div>

          <div className="flex w-fit rounded-md border border-white/10 bg-[#141414] p-1">
            <Link href="/history" className="rounded bg-[#E50914] px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
              Per Anime
            </Link>
            <Link href="/history/episodes" className="rounded px-4 py-2 text-xs font-black uppercase tracking-widest text-neutral-300 hover:bg-white/10 hover:text-white">
              Per Episode
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        {history.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-[#141414] p-10 text-center">
            <h2 className="text-xl font-black text-white">Belum ada history.</h2>
            <p className="mt-2 text-sm font-bold text-neutral-400">Tonton episode dulu, nanti daftar anime terakhir muncul di sini.</p>
            <Link href="/" className="btn-primary mt-6 inline-flex text-xs font-black uppercase tracking-widest">
              Mulai Nonton
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="mb-4 text-xl font-black text-white">Anime Saya</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
            {history.map((item) => (
              <article key={item.anime_slug} className="group">
                <Link href={item.episode_path} prefetch={false} className="poster-card block aspect-[2/3] bg-[#141414]">
                  {item.poster_url ? (
                    <img src={item.poster_url} alt={item.anime_title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-[#141414]" />
                  )}
                  <span className="absolute inset-x-0 bottom-0 z-10 p-3">
                    <span className="inline-flex rounded bg-[#E50914] px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white">Lanjut</span>
                  </span>
                </Link>
                <div className="mt-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#E50914]">{item.source}</p>
                  <h2 className="mt-1 line-clamp-2 text-sm font-black leading-snug text-neutral-100">{item.anime_title}</h2>
                  <p className="mt-1 line-clamp-1 text-xs font-bold text-neutral-500">{item.episode_title}</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">{formatDate(item.watched_at)}</p>
                  <Link href={item.anime_path} prefetch={false} className="mt-3 inline-flex text-[10px] font-black uppercase tracking-widest text-neutral-300 hover:text-white">
                    Detail
                  </Link>
                </div>
              </article>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
