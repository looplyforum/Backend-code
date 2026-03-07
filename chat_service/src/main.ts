import express from "express"
import cors from "cors"
import morgan from "morgan"
import { config } from "dotenv"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser";
import { verifyToken } from "./middlewares/middleware"
import { initializeSocket } from "./utils/socket"

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
  customLabels: { project_name: 'looply', service: 'chat' },
  promClient: {
    collectDefaultMetrics: {}
  }
});

app.use(metricsMiddleware);

app.use(cors())
app.use(morgan("dev"))
app.use(express.json())

app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

app.use(verifyToken);

app.get("/health", (_, res) => {
  return res.status(200).json({ status: "ok" });
});

import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes";

app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

const server = initializeSocket(app);

server.listen(PORT, () => {
  console.log(`Chat service is running on port ${PORT}`)
})