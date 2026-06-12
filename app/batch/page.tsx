import BatchPageClient, { type BatchResponse } from "@/components/pages/BatchPageClient";
import { fetchAnimeApi } from "@/lib/anime-api";

export const revalidate = 3600;

type BatchApiResponse = {
  data?: { batchList?: BatchResponse["batchList"] };
  pagination?: BatchResponse["pagination"];
};

export default async function BatchPage() {
  try {
    const response = await fetchAnimeApi<BatchApiResponse>("/samehadaku/batch?page=1", revalidate);
    const initialData: BatchResponse = {
      batchList: response.data?.batchList ?? [],
      pagination: response.pagination ?? {
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        totalPages: 1,
      },
    };

    return <BatchPageClient initialData={initialData} />;
  } catch {
    return <BatchPageClient initialData={null} />;
  }
}
