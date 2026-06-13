type AnimeApiErrorPayload = {
  statusCode?: unknown;
  statusMessage?: unknown;
  message?: unknown;
  error?: unknown;
};

export function isAnimeNotFoundResponse(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;

  const response = payload as AnimeApiErrorPayload;
  if (response.statusCode === 404) return true;

  return [response.statusMessage, response.message, response.error].some(
    (value) => typeof value === "string" && /(?:status code\s*)?404|not found|tidak ditemukan/i.test(value),
  );
}
