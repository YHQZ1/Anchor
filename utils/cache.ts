import redis from "@/lib/redis";

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<{ data: T; cached: boolean }> {
  try {
    if (!redis.isOpen) await redis.connect();

    const cached = await redis.get(key);
    if (cached) {
      return {
        data: JSON.parse(cached),
        cached: true,
      };
    }

    const result = await fetcher();

    await redis.setEx(key, ttlSeconds, JSON.stringify(result));

    return {
      data: result,
      cached: false,
    };
  } catch (err) {
    console.error("Redis caching error:", err);

    const result = await fetcher();
    return {
      data: result,
      cached: false,
    };
  }
}

export async function clearCache(key: string): Promise<void> {
  try {
    if (!redis.isOpen) await redis.connect();
    await redis.del(key);
  } catch (err) {
    console.error("Redis clear error:", err);
  }
}
