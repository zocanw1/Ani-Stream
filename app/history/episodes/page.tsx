import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getEpisodeHistory } from "@/lib/watch-history";

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

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a29bfe]">Watch History</p>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">History Episode</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-gray-500">
              Semua episode yang pernah kamu buka, urut dari paling baru.
            </p>
          </div>

          <div className="flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
            <Link href="/history" className="rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white">
              Per Anime
            </Link>
            <Link href="/history/episodes" className="rounded-xl bg-[#6c5ce7] px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
              Per Episode
            </Link>
          </div>
        </header>

        {history.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <h2 className="text-xl font-black text-white">Belum ada episode.</h2>
            <p className="mt-2 text-sm text-gray-500">Episode yang kamu tonton akan muncul di halaman ini.</p>
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
                className="glass group flex gap-4 rounded-3xl p-4 transition-all hover:border-[#6c5ce7]/40 hover:bg-white/[0.04]"
              >
                {item.poster_url ? (
                  <img src={item.poster_url} alt={item.anime_title} className="h-24 w-16 flex-shrink-0 rounded-2xl object-cover ring-1 ring-white/10" />
                ) : (
                  <div className="h-24 w-16 flex-shrink-0 rounded-2xl bg-white/5" />
                )}
                <span className="flex min-w-0 flex-1 flex-col justify-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#a29bfe]">{item.source}</span>
                  <span className="mt-1 line-clamp-1 text-sm font-black text-white group-hover:text-[#a29bfe]">{item.anime_title}</span>
                  <span className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-gray-500">{item.episode_title}</span>
                  <span className="mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-600">{formatDate(item.watched_at)}</span>
                </span>
                <span className="hidden items-center self-center rounded-xl bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all group-hover:bg-[#6c5ce7] group-hover:text-white sm:flex">
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
