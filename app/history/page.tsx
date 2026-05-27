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
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a29bfe]">Watch History</p>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">History Anime</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-gray-500">
              Satu episode terakhir dari setiap anime yang pernah kamu tonton.
            </p>
          </div>

          <div className="flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
            <Link href="/history" className="rounded-xl bg-[#6c5ce7] px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
              Per Anime
            </Link>
            <Link href="/history/episodes" className="rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white">
              Per Episode
            </Link>
          </div>
        </header>

        {history.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <h2 className="text-xl font-black text-white">Belum ada history.</h2>
            <p className="mt-2 text-sm text-gray-500">Tonton episode dulu, nanti daftar anime terakhir muncul di sini.</p>
            <Link href="/" className="btn-primary mt-6 inline-flex text-xs font-black uppercase tracking-widest">
              Mulai Nonton
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {history.map((item) => (
              <article key={item.anime_slug} className="glass group rounded-3xl p-4 transition-all hover:border-[#6c5ce7]/40">
                <div className="flex gap-4">
                  {item.poster_url ? (
                    <img src={item.poster_url} alt={item.anime_title} className="h-32 w-24 flex-shrink-0 rounded-2xl object-cover ring-1 ring-white/10" />
                  ) : (
                    <div className="h-32 w-24 flex-shrink-0 rounded-2xl bg-white/5" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#a29bfe]">{item.source}</p>
                      <h2 className="mt-2 line-clamp-2 text-base font-black leading-snug text-white">{item.anime_title}</h2>
                      <p className="mt-2 line-clamp-2 text-xs font-bold leading-5 text-gray-500">{item.episode_title}</p>
                    </div>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-600">{formatDate(item.watched_at)}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link href={item.episode_path} prefetch={false} className="rounded-xl bg-[#6c5ce7] px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#5a4ecf]">
                    Lanjut
                  </Link>
                  <Link href={item.anime_path} prefetch={false} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-300 transition-all hover:bg-white/10 hover:text-white">
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
