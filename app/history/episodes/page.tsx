import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getEpisodeHistory } from "@/lib/watch-history";
import Image from "next/image";

export const metadata = {
  title: "History Episode - AniStream",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function EpisodeHistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/history/episodes");
  }

  const history = await getEpisodeHistory(user.id);
  const featured = history[0];

  return (
    <div className="min-h-screen bg-[#050505] pb-20 text-white">
      <section className="relative overflow-hidden px-4 pb-14 pt-12 sm:px-6 lg:px-8">
        {featured?.poster_url && (
          <Image src={featured.poster_url} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-20 blur-sm" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 pt-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#E50914]">Watch History</p>
            <h1 className="mt-4 text-4xl font-black leading-none text-white sm:text-6xl">Episode Timeline</h1>
            <p className="mt-4 max-w-2xl text-sm font-bold leading-7 text-neutral-300 sm:text-base">
              Semua episode yang pernah kamu buka, urut dari paling baru.
            </p>
          </div>

          <div className="flex w-fit rounded-md border border-white/10 bg-[#141414] p-1">
            <Link href="/history" className="rounded px-4 py-2 text-xs font-black uppercase tracking-widest text-neutral-300 hover:bg-white/10 hover:text-white">
              Per Anime
            </Link>
            <Link href="/history/episodes" className="rounded bg-[#E50914] px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
              Per Episode
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        {history.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-[#141414] p-10 text-center">
            <h2 className="text-xl font-black text-white">Belum ada episode.</h2>
            <p className="mt-2 text-sm font-bold text-neutral-400">Episode yang kamu tonton akan muncul di halaman ini.</p>
            <Link href="/" className="btn-primary mt-6 inline-flex text-xs font-black uppercase tracking-widest">
              Cari Anime
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <Link
                key={item.episode_path}
                href={item.episode_path}
                prefetch={false}
                className="group flex gap-4 rounded-lg border border-white/10 bg-[#141414] p-3 transition-all hover:scale-[1.01] hover:bg-[#1f1f1f]"
              >
                {item.poster_url ? (
                  <span className="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-md">
                    <Image src={item.poster_url} alt={item.anime_title} fill sizes="5rem" className="object-cover" />
                  </span>
                ) : (
                  <div className="h-28 w-20 flex-shrink-0 rounded-md bg-[#1f1f1f]" />
                )}
                <span className="flex min-w-0 flex-1 flex-col justify-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#E50914]">{item.source}</span>
                  <span className="mt-1 line-clamp-1 text-base font-black text-white group-hover:text-neutral-200">{item.anime_title}</span>
                  <span className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-neutral-400">{item.episode_title}</span>
                  <span className="mt-3 text-[10px] font-black uppercase tracking-widest text-neutral-600">{formatDate(item.watched_at)}</span>
                </span>
                <span className="hidden items-center self-center rounded bg-[#E50914] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all group-hover:bg-[#B20710] sm:flex">
                  Tonton
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
