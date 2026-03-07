import { Queue } from "bullmq";

const NotificationEventQueue = new Queue("notification-events", {
   connection: {
        host: process.env.REDIS_HOST || "redis",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: "looplyredispassword"
    },
});

export  {NotificationEventQueue}