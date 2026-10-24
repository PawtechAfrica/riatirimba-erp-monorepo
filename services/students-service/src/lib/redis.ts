import Redis from "ioredis";

// const redis = new Redis({
//     password: process.env.REDIS_PASSWORD,
//     host: process.env.REDIS_HOST || "127.0.0.1",
//     port: 6379,
//     maxRetriesPerRequest: null,
// });
const redis = new Redis(process.env.VALKEY_URL || "redis://:TheRiseOfValkey@valkey:6379", {
    maxRetriesPerRequest: null,
});
export default redis;
