import HomePageClient, { type HomePageInitialData } from "@/components/pages/HomePageClient";
import { fetchAnimeApi } from "@/lib/anime-api";

export const revalidate = 1800;

type ApiEnvelope<T> = {
  data: T;
  pagination?: HomePageInitialData["ongoingData"]["pagination"];
};

async function getInitialData(): Promise<HomePageInitialData | null> {
  try {
    const [home, schedule, popular, ongoing] = await Promise.all([
      fetchAnimeApi<ApiEnvelope<HomePageInitialData["homeData"]>>("/samehadaku/home", revalidate),
      fetchAnimeApi<ApiEnvelope<{ days: HomePageInitialData["scheduleData"] }>>("/samehadaku/schedule", 3600),
      fetchAnimeApi<ApiEnvelope<{ animeList: HomePageInitialData["popularData"] }>>("/samehadaku/popular", revalidate),
      fetchAnimeApi<ApiEnvelope<{ animeList: HomePageInitialData["ongoingData"]["animeList"] }>>(
        "/samehadaku/ongoing?page=1",
        revalidate,
      ),
    ]);

    const initialData: HomePageInitialData = {
      homeData: home.data,
      scheduleData: schedule.data.days,
      popularData: popular.data.animeList.slice(0, 7),
      ongoingData: {
        animeList: ongoing.data.animeList,
        pagination: ongoing.pagination ?? {
          currentPage: 1,
          hasNextPage: false,
          hasPrevPage: false,
          totalPages: 1,
        },
      },
    };

    return initialData;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const initialData = await getInitialData();
  return (
    <HomePageClient
      initialData={initialData}
      initialError={initialData ? null : "Gagal memuat data anime dari server."}
    />
  );
}
