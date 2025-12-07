import redis from "@/lib/redis";

export async function tokenBucketLimit(
  key: string,
  capacity: number,
  refillRate: number
) {
  const now = Date.now();
  const data = await redis.hGetAll(key);

  const tokens = data.tokens ? parseInt(data.tokens) : capacity;
  const lastRefill = data.lastRefill ? parseInt(data.lastRefill) : now;

  const elapsed = Math.floor((now - lastRefill) / 1000);
  const refillAmount = elapsed * refillRate;

  let newTokens = Math.min(capacity, tokens + refillAmount);
  const allowed = newTokens > 0;
  if (allowed) newTokens--;

  await redis.hSet(key, {
    tokens: newTokens.toString(),
    lastRefill: now.toString(),
  });

  return allowed;
}
