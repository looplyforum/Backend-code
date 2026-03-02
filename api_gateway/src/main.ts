import express from "express"
import cors from "cors"
import morgan from "morgan"
import { config } from "dotenv"
import { createProxyMiddleware } from "http-proxy-middleware"
import { verifyToken } from "./utils/middleware"
import cookieParser from "cookie-parser"

import cluster from "node:cluster"
import os from "node:os"
import process from "node:process"

const app = express();

config({
  path: "./.env",
});

app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("Welcome to the Looply API Gateway!");
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