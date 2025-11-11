import { createClient } from "redis";

const isProd = !!process.env.REDIS_URL_PROD;

const redis = createClient({
  url: process.env.REDIS_URL_PROD || process.env.REDIS_URL_LOCAL || "redis://localhost:6379",
  socket: isProd
    ? { tls: true, rejectUnauthorized: false }
    : undefined,
});

redis.on("error", (err) => console.error("Redis client error:", err));

(async () => {
  if (!redis.isOpen) await redis.connect();
})();

export default redis;
