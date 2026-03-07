import express from "express"
import cors from "cors"
import morgan from "morgan"
import { config } from "dotenv"
import { createProxyMiddleware } from "http-proxy-middleware"
import cookieParser from "cookie-parser"
import cluster from "node:cluster"
import os from "node:os"
import process from "node:process"

import { setupSwagger } from "./utils/swagger";

import { verifyToken } from "./utils/middleware"

const app = express();

config({
  path: "./.env",
});

import promBundle from "express-prom-bundle";

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { project_name: 'looply', service: 'api_gateway' },
  promClient: {
    collectDefaultMetrics: {}
  }
});

app.use(metricsMiddleware);

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(cookieParser());




setupSwagger(app);

app.get("/health", (_, res) => {
  return res.status(200).json({ status: "ok" });
});

// Proxy configuration for services
// http://localhost:3000/auth
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://auth:4000",
    changeOrigin: true,
    pathRewrite: { "^/auth": "" },
    logger: console,
  })
);

app.use(
  "/notification",
  createProxyMiddleware({
    target: "http://notification:4000",
    changeOrigin: true,
    pathRewrite: { "^/notification": "" },
    logger: console,
  })
);

// verify every request with token 
app.use(
  "/posts",
  verifyToken,
  createProxyMiddleware({
    target: "http://posts:4000",
    changeOrigin: true,
    pathRewrite: { "^/posts": "" },
    logger: console,
    

  })
);


app.use(
  "/chat",
  verifyToken,
  createProxyMiddleware({
    target: "http://chat:4000",
    changeOrigin: true,
    pathRewrite: { "^/chat": "" },
    logger: console,
    

  })
);
const PORT = process.env.PORT || 3000;

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Optionally restart the worker
    cluster.fork();
  });
} else {
  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
  });
}

// app.listen(PORT, () => {
//   console.log(`API Gateway running on port ${PORT}`);
// });