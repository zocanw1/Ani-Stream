import SearchPageClient, { type SearchAnime } from "@/components/pages/SearchPageClient";
import { fetchAnimeApi } from "@/lib/anime-api";

export const revalidate = 1800;

type SearchResponse = {
  data?: { animeList?: SearchAnime[] };
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = String((await searchParams).q ?? "").trim().slice(0, 100);
  if (!query) {
    return <SearchPageClient initialQuery="" initialResults={null} />;
  }

  try {
    const response = await fetchAnimeApi<SearchResponse>(
      `/samehadaku/search?q=${encodeURIComponent(query)}`,
      revalidate,
    );
    return <SearchPageClient initialQuery={query} initialResults={response.data?.animeList ?? []} />;
  } catch {
    return (
      <SearchPageClient
        initialQuery={query}
        initialResults={null}
        initialError="Gagal mengambil hasil pencarian."
      />
    );
  }
}
