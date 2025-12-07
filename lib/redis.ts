import { createClient } from "redis";

const isProd = Boolean(process.env.REDIS_URL_PROD);

const redis = createClient({
  url:
    process.env.REDIS_URL_PROD ||
    process.env.REDIS_URL_LOCAL ||
    "redis://localhost:6379",
  socket: isProd ? { tls: true, rejectUnauthorized: false } : undefined,
});

redis.on("error", () => {});

if (!redis.isOpen) {
  redis.connect().catch(() => {});
}

export default redis;
