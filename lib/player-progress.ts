export const PLAYER_PROGRESS_EVENT = "anistream:player-progress";

export type PlayerProgress = {
  watchedSeconds: number;
  durationSeconds: number | null;
  progressPercent: number | null;
  progressSource: "player";
  isCompleted: boolean;
};

export type PlayerProgressEventDetail = {
  src: string;
  progress: PlayerProgress;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseMessageData(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    try {
      return asRecord(JSON.parse(value));
    } catch {
      return null;
    }
  }

  return asRecord(value);
}

function readFiniteNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function readBoolean(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (record[key] === true) return true;
  }
  return false;
}

export function normalizePlayerProgress(value: unknown): PlayerProgress | null {
  const outer = parseMessageData(value);
  if (!outer) return null;

  const nested = parseMessageData(outer.data);
  const payload = nested ?? outer;
  const watchedSeconds = readFiniteNumber(payload, [
    "currentTime",
    "current_time",
    "position",
    "watchedSeconds",
    "watched_seconds",
  ]);

  if (watchedSeconds === null || watchedSeconds < 0) return null;

  const rawDuration = readFiniteNumber(payload, [
    "duration",
    "durationSeconds",
    "duration_seconds",
  ]);
  const durationSeconds = rawDuration !== null && rawDuration > 0 ? rawDuration : null;
  const boundedWatchedSeconds =
    durationSeconds === null ? watchedSeconds : Math.min(watchedSeconds, durationSeconds);
  const progressPercent =
    durationSeconds === null
      ? null
      : Math.round((boundedWatchedSeconds / durationSeconds) * 10_000) / 100;

  return {
    watchedSeconds: boundedWatchedSeconds,
    durationSeconds,
    progressPercent,
    progressSource: "player",
    isCompleted: readBoolean(payload, ["ended", "completed", "isCompleted", "is_completed"]),
  };
}
