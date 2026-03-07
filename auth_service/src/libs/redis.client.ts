import { createClient } from "redis";

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || "redis",
        port: parseInt(process.env.REDIS_PORT || "6379"),
    },
    password: process.env.REDIS_PASSWORD || "looplyredispassword",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Connected to Redis in Auth Service");
    }
}

export { redisClient, connectRedis };
