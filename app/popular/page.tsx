import PopularPageClient, { type PaginatedAnime } from "@/components/pages/PopularPageClient";
import { fetchAnimeApi } from "@/lib/anime-api";

export const revalidate = 1800;

type PopularResponse = {
  data?: { animeList?: PaginatedAnime["animeList"] };
  pagination?: PaginatedAnime["pagination"];
};

export default async function PopularPage() {
  try {
    const response = await fetchAnimeApi<PopularResponse>("/samehadaku/popular?page=1", revalidate);
    const initialData: PaginatedAnime = {
      animeList: response.data?.animeList ?? [],
      pagination: response.pagination ?? {
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
        totalPages: 1,
      },
    };

    return <PopularPageClient initialData={initialData} />;
  } catch {
    return <PopularPageClient initialData={null} />;
  }
}
