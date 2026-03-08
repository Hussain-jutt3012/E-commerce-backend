import {createClient} from "@redis/client"

const redisClient = createClient({
  url: process.env.REDIS_URL
});


redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});


redisClient.on("connect", () => {
  console.log("Redis client connected successfully");
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
};

export { redisClient, connectRedis };
