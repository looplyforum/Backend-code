import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "dotenv";
import authRoute from "./routes/auth.route";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import promBundle from "express-prom-bundle";

config({ path: "./.env" });

const app = express();


const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { project_name: 'looply', service: 'auth' },
  promClient: {
    collectDefaultMetrics: {}
  }
});

app.use(metricsMiddleware);

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);



app.use("/", authRoute);

export {
  app
}