const Redis = require("ioredis");

const redisEnabled = process.env.REDIS_ENABLED !== "false";

if (!redisEnabled) {
  console.warn("⚠️ Redis disabled by REDIS_ENABLED=false");
}

// Support both REDIS_URL and individual env vars
let redisConfig = process.env.REDIS_URL
  ? process.env.REDIS_URL
  : {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    };



const redis = redisEnabled ? new Redis(redisConfig) : {
  get: async () => null,
  setex: async () => "OK",
  del: async () => 0,
  publish: async () => 0,
  duplicate: () => redis,
  on: () => redis,
};

redis.on("connect", () => {
  console.log("✅ Redis Connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

redis.isEnabled = redisEnabled;

module.exports = redis;
