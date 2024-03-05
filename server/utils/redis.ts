import "dotenv/config";
import { Redis } from "ioredis";

const REDIS_URI = process.env.REDIS_URI as string;

const redisClient = () => {
  if (REDIS_URI) {
    console.log("Redis connected");
    return REDIS_URI;
  }
  throw new Error("Redis connection failed");
};

export const redis = new Redis(redisClient());
