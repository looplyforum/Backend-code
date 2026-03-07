import express from "express"
import cors from "cors"
import morgan from "morgan"
import {config} from "dotenv"
import notificationRoute from "./routes/notification.route"
import rateLimit from "express-rate-limit"
import { connectRedis } from "./libs/redis"
import cookieParser from "cookie-parser"

config({
    path: "./.env"
});

const PORT = process.env.PORT || 4000
const app = express()

import promBundle from "express-prom-bundle";

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { project_name: 'looply', service: 'notification' },
  promClient: {
    collectDefaultMetrics: {}
  }
});

app.use(metricsMiddleware);

app.use(cors())
app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())

connectRedis().catch((error) => {
    console.error("Failed to connect to Redis:", error);
    process.exit(1); // Exit the application if Redis connection fails
});

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})


app.use("/" , notificationRoute)



app.listen(PORT,  () => {
  console.log(`Notification service is running on port ${PORT}`)
})