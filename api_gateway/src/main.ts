import express from "express"
import cors from "cors"
import morgan from "morgan"
import { createProxyMiddleware } from "http-proxy-middleware"

const app = express();

// Security middleware

app.use(cors());
app.use(morgan("dev"));


app.get("/", (req, res) => {
  res.send("Welcome to the Looply API Gateway!");
});


// Proxy configuration for services
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://auth:4000",
    changeOrigin: true,
    pathRewrite: { "^/auth": "" },
  })
);
// http://localhost:3000/auth -> redirect auth service 




app.use(
  "/notification",
  createProxyMiddleware({
    target: "http://notification:4000",
    changeOrigin: true,
    pathRewrite: { "^/notification": "" },
  })
);


app.use(
  "/upload",
  createProxyMiddleware({
    target: "http://upload:4000",
    changeOrigin: true,
    pathRewrite: { "^/upload": "" },
  })
);

app.listen(3000, () => {
  console.log("API Gateway running on port 3000");
});
