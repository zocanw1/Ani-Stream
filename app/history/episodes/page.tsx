import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getEpisodeHistory } from "@/lib/watch-history";
import Image from "next/image";
import { normalizeHistorySource } from "@/lib/history";

export const metadata = {
  title: "History Episode - AniStream",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type EpisodeHistoryPageProps = {
  searchParams: Promise<{ source?: string | string[] }>;
};

export default async function EpisodeHistoryPage({ searchParams }: EpisodeHistoryPageProps) {
  const params = await searchParams;
  const source = normalizeHistorySource(
    Array.isArray(params.source) ? params.source[0] : params.source,
  );
  const user = await getCurrentUser();
  if (!user) {
    const nextPath =
      source === "all" ? "/history/episodes" : `/history/episodes?source=${source}`;
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const history = await getEpisodeHistory(user.id, 100, source);
  const featured = history[0];
  const animeHistoryHref = source === "all" ? "/history" : `/history?source=${source}`;
  const sourceTabs = [
    { label: "Semua", value: "all", href: "/history/episodes" },
    {
      label: "Samehadaku",
      value: "samehadaku",
      href: "/history/episodes?source=samehadaku",
    },
    {
      label: "Otakudesu",
      value: "otakudesu",
      href: "/history/episodes?source=otakudesu",
    },
  ] as const;

  return (
    <div className="min-h-screen pb-20 text-white" style={{background: "var(--bg-deep)"}}>
      <section className="relative overflow-hidden px-4 pb-14 pt-12 sm:px-6 lg:px-8">
        {featured?.poster_url && (
          <Image src={featured.poster_url} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-20 blur-sm" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 pt-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.35em]" style={{color: "var(--primary)"}}>Watch History</p>
            <h1 className="mt-4 text-4xl font-black leading-none text-white sm:text-6xl">Episode Timeline</h1>
            <p className="mt-4 max-w-2xl text-sm font-bold leading-7 text-neutral-300 sm:text-base">
              Semua episode yang pernah kamu buka, urut dari paling baru.
            </p>
          </div>

          <div className="flex w-fit rounded-md border border-white/10 bg-[#141414] p-1">
            <Link href={animeHistoryHref} className="rounded px-4 py-2 text-xs font-black uppercase tracking-widest text-neutral-300 hover:bg-white/10 hover:text-white">
              Per Anime
            </Link>
            <Link href="/history/episodes" className="rounded px-4 py-2 text-xs font-black uppercase tracking-widest text-white" style={{background: "linear-gradient(135deg, var(--primary), var(--secondary))"}}>
              Per Episode
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <nav aria-label="Filter sumber history" className="flex w-full gap-2 overflow-x-auto rounded-lg border border-white/10 bg-[#141414] p-2">
          {sourceTabs.map((tab) => (
            <Link
              key={tab.value}
              href={tab.href}
              aria-current={source === tab.value ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
                source === tab.value
                  ? "text-white"
                  : "text-neutral-400 hover:bg-white/10 hover:text-white"
              }`}
              style={source === tab.value ? {background: "linear-gradient(135deg, var(--primary), var(--secondary))"} : {}}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {history.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-[#141414] p-10 text-center">
            <h2 className="text-xl font-black text-white">Belum ada episode.</h2>
            <p className="mt-2 text-sm font-bold text-neutral-400">Episode yang kamu tonton akan muncul di halaman ini.</p>
            <Link href="/" className="mt-6 inline-flex text-xs font-black uppercase tracking-widest btn-primary">
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
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{color: "var(--primary)"}}>{item.source}</span>
                  <span className="mt-1 line-clamp-1 text-base font-black text-white group-hover:text-neutral-200">{item.anime_title}</span>
                  <span className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-neutral-400">{item.episode_title}</span>
                  {item.progress_source === "player" && item.progress_percent !== null && (
                    <span className="mt-3">
                      <span className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-neutral-500">
                        <span>{item.is_completed ? "Selesai" : "Progress asli player"}</span>
                        <span>{Math.round(item.progress_percent)}%</span>
                      </span>
                      <span className="block h-1 overflow-hidden rounded-full bg-white/10">
                        <span
                          className="block h-full"
                          style={{background: "linear-gradient(90deg, var(--primary), var(--secondary))", width: `${Math.max(0, Math.min(100, item.progress_percent))}%`}}
                        />
                      </span>
                    </span>
                  )}
                  <span className="mt-3 text-[10px] font-black uppercase tracking-widest text-neutral-600">{formatDate(item.watched_at)}</span>
                </span>
                <span className="hidden items-center self-center rounded px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all sm:flex" style={{background: "linear-gradient(135deg, var(--primary), var(--secondary))"}}>
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
