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
            <p className="inline-flex rotate-[-2deg] rounded-lg border-[3px] border-[#1E1B29] bg-[#00CEC9] px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#1E1B29] shadow-[4px_4px_0_#1E1B29]">Watch History</p>
            <h1 className="font-display mt-5 text-3xl font-black text-[#6C5CE7] [-webkit-text-stroke:1.5px_#1E1B29] [text-shadow:3px_3px_0_#1E1B29] sm:text-4xl">History Episode</h1>
            <p className="mt-2 max-w-2xl text-sm font-extrabold leading-7 text-[#1E1B29]/75">
              Semua episode yang pernah kamu buka, urut dari paling baru.
            </p>
          </div>

          <div className="flex rounded-2xl border-[3px] border-[#1E1B29] bg-white p-1 shadow-[5px_5px_0_#1E1B29]">
            <Link href="/history" className="rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-[#1E1B29] hover:bg-[#FAF9FF]">
              Per Anime
            </Link>
            <Link href="/history/episodes" className="rounded-xl bg-[#FDCB6E] px-4 py-2 text-xs font-black uppercase tracking-widest text-[#1E1B29]">
              Per Episode
            </Link>
          </div>
        </header>

        {history.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <h2 className="font-display text-xl font-black text-[#1E1B29]">Belum ada episode.</h2>
            <p className="mt-2 text-sm font-extrabold text-[#1E1B29]/75">Episode yang kamu tonton akan muncul di halaman ini.</p>
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
                className="glass group flex gap-4 rounded-[22px] p-4 transition-all"
              >
                {item.poster_url ? (
                  <img src={item.poster_url} alt={item.anime_title} className="h-24 w-16 flex-shrink-0 rounded-2xl object-cover border-[3px] border-[#1E1B29]" />
                ) : (
                  <div className="h-24 w-16 flex-shrink-0 rounded-2xl border-[3px] border-[#1E1B29] bg-[#FAF9FF]" />
                )}
                <span className="flex min-w-0 flex-1 flex-col justify-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#6C5CE7]">{item.source}</span>
                  <span className="font-display mt-1 line-clamp-1 text-sm font-black text-[#1E1B29] group-hover:text-[#FF7675]">{item.anime_title}</span>
                  <span className="mt-1 line-clamp-2 text-xs font-extrabold leading-5 text-[#1E1B29]/75">{item.episode_title}</span>
                  <span className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#1E1B29]/60">{formatDate(item.watched_at)}</span>
                </span>
                <span className="hidden items-center self-center rounded-xl border-[3px] border-[#1E1B29] bg-[#00CEC9] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#1E1B29] shadow-[4px_4px_0_#1E1B29] transition-all group-hover:bg-[#FF7675] group-hover:text-white sm:flex">
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
