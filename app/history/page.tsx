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

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex rotate-[-2deg] rounded-lg border-[3px] border-[#1E1B29] bg-[#00CEC9] px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#1E1B29] shadow-[4px_4px_0_#1E1B29]">Watch History</p>
            <h1 className="font-display mt-5 text-3xl font-black text-[#6C5CE7] [-webkit-text-stroke:1.5px_#1E1B29] [text-shadow:3px_3px_0_#1E1B29] sm:text-4xl">History Anime</h1>
            <p className="mt-2 max-w-2xl text-sm font-extrabold leading-7 text-[#1E1B29]/75">
              Satu episode terakhir dari setiap anime yang pernah kamu tonton.
            </p>
          </div>

          <div className="flex rounded-2xl border-[3px] border-[#1E1B29] bg-white p-1 shadow-[5px_5px_0_#1E1B29]">
            <Link href="/history" className="rounded-xl bg-[#FDCB6E] px-4 py-2 text-xs font-black uppercase tracking-widest text-[#1E1B29]">
              Per Anime
            </Link>
            <Link href="/history/episodes" className="rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-[#1E1B29] hover:bg-[#FAF9FF]">
              Per Episode
            </Link>
          </div>
        </header>

        {history.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <h2 className="font-display text-xl font-black text-[#1E1B29]">Belum ada history.</h2>
            <p className="mt-2 text-sm font-extrabold text-[#1E1B29]/75">Tonton episode dulu, nanti daftar anime terakhir muncul di sini.</p>
            <Link href="/" className="btn-primary mt-6 inline-flex text-xs font-black uppercase tracking-widest">
              Mulai Nonton
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {history.map((item) => (
              <article key={item.anime_slug} className="glass group rounded-[22px] p-4 transition-all">
                <div className="flex gap-4">
                  {item.poster_url ? (
                    <img src={item.poster_url} alt={item.anime_title} className="h-32 w-24 flex-shrink-0 rounded-2xl object-cover border-[3px] border-[#1E1B29]" />
                  ) : (
                    <div className="h-32 w-24 flex-shrink-0 rounded-2xl border-[3px] border-[#1E1B29] bg-[#FAF9FF]" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#6C5CE7]">{item.source}</p>
                      <h2 className="font-display mt-2 line-clamp-2 text-base font-black leading-snug text-[#1E1B29]">{item.anime_title}</h2>
                      <p className="mt-2 line-clamp-2 text-xs font-extrabold leading-5 text-[#1E1B29]/75">{item.episode_title}</p>
                    </div>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#1E1B29]/60">{formatDate(item.watched_at)}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link href={item.episode_path} prefetch={false} className="rounded-xl border-[3px] border-[#1E1B29] bg-[#FF7675] px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-white shadow-[4px_4px_0_#1E1B29] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5">
                    Lanjut
                  </Link>
                  <Link href={item.anime_path} prefetch={false} className="rounded-xl border-[3px] border-[#1E1B29] bg-white px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-[#1E1B29] shadow-[4px_4px_0_#1E1B29] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#FDCB6E]">
                    Detail
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
