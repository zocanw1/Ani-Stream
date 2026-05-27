export function normalizeNextPath(value: unknown, fallback = "/") {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;

  try {
    const parsed = new URL(trimmed, "http://anistream.local");
    if (parsed.origin !== "http://anistream.local") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
