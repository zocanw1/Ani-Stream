import UnlimitedClient, {
  type AnimeGroup,
} from "@/components/otakudesu/UnlimitedClient";
import { fetchAnimeApi } from "@/lib/anime-api";

type UnlimitedResponse = {
  data?: {
    list?: AnimeGroup[];
  };
};

export default async function UnlimitedOtakudesuPage() {
  try {
    const response = await fetchAnimeApi<UnlimitedResponse>("/unlimited", 3600);

    return <UnlimitedClient data={response.data?.list ?? []} />;
  } catch {
    return (
      <UnlimitedClient
        data={[]}
        error="Daftar anime Otakudesu sedang tidak dapat dimuat."
      />
    );
  }
}
