const ANIME_API_BASE_URL = "https://www.sankavollerei.com/anime";

export async function fetchAnimeApi<T>(path: string, revalidate: number): Promise<T> {
  const response = await fetch(`${ANIME_API_BASE_URL}${path}`, {
    next: { revalidate },
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Anime API request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}
