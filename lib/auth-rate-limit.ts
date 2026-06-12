import { createHash } from "crypto";
import { ensureDatabase, getSql } from "./db";

export type AuthAction = "login" | "register";

export type AuthRateLimitPolicy = {
  key: string;
  limit: number;
  windowSeconds: number;
};

export type AuthRateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getClientAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function getAuthRateLimitPolicies(action: AuthAction, address: string, email: string): AuthRateLimitPolicy[] {
  const normalizedEmail = email.trim().toLowerCase();
  const addressKey = hash(`${action}:address:${address}`);

  if (action === "register") {
    return [{ key: addressKey, limit: 5, windowSeconds: 60 * 60 }];
  }

  return [
    { key: addressKey, limit: 20, windowSeconds: 15 * 60 },
    { key: hash(`${action}:account:${normalizedEmail}`), limit: 8, windowSeconds: 15 * 60 },
  ];
}

async function consumePolicy(policy: AuthRateLimitPolicy): Promise<AuthRateLimitResult> {
  await ensureDatabase();
  const rows = await getSql()`
    INSERT INTO auth_rate_limits (key_hash, attempts, window_started_at, updated_at)
    VALUES (${policy.key}, 1, NOW(), NOW())
    ON CONFLICT (key_hash) DO UPDATE SET
      attempts = CASE
        WHEN auth_rate_limits.window_started_at <= NOW() - (${policy.windowSeconds} * INTERVAL '1 second') THEN 1
        ELSE auth_rate_limits.attempts + 1
      END,
      window_started_at = CASE
        WHEN auth_rate_limits.window_started_at <= NOW() - (${policy.windowSeconds} * INTERVAL '1 second') THEN NOW()
        ELSE auth_rate_limits.window_started_at
      END,
      updated_at = NOW()
    RETURNING attempts, window_started_at
  `;

  const row = (rows as unknown as { attempts: number; window_started_at: string | Date }[])[0];
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(row.window_started_at).getTime()) / 1000));

  return {
    allowed: row.attempts <= policy.limit,
    retryAfterSeconds: Math.max(1, policy.windowSeconds - elapsedSeconds),
  };
}

export async function checkAuthRateLimit(
  request: Request,
  action: AuthAction,
  email: string,
): Promise<AuthRateLimitResult> {
  const policies = getAuthRateLimitPolicies(action, getClientAddress(request), email);
  let retryAfterSeconds = 1;

  for (const policy of policies) {
    const result = await consumePolicy(policy);
    retryAfterSeconds = Math.max(retryAfterSeconds, result.retryAfterSeconds);
    if (!result.allowed) return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}
