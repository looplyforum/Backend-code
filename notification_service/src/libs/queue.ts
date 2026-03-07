import { Queue } from "bullmq";
import { connection } from "../utils/connection";


const NotificationEventQueue = new Queue("notification-events", { connection });
const EmailQueue = new Queue("email-queue", { connection });
const InAppQueue = new Queue("inapp-queue", { connection });

export {
  NotificationEventQueue,
  EmailQueue,
  InAppQueue
};