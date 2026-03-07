import { Queue } from "bullmq";

const emailQueue = new Queue("email-queue", {
   connection: {
        host: process.env.REDIS_HOST || "redis",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: "looplyredispassword"
    },
});

export default emailQueue;