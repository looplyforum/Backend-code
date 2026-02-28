import express from "express"
import cors from "cors"
import morgan from "morgan"
import { config } from "dotenv"
import { createProxyMiddleware } from "http-proxy-middleware"
import { verifyToken } from "./utils/middleware"

const app = express();

// Security middleware
config({
  path: "./.env",
});

app.use(cors());
app.use(morgan("dev"));


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
  })
);


app.listen(3000, () => {
  console.log("API Gateway running on port 3000");
});
