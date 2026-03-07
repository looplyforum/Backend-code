import express from "express"
import cors from "cors"
import morgan from "morgan"
import { config } from "dotenv"
import rateLimit from "express-rate-limit"
import postRoute from "./routes/post.route"
import ApplicationRoute from "./routes/application.route"
import cookieParser from "cookie-parser";
import { verifyToken } from "./middlewares/middleware"
import promBundle from "express-prom-bundle";

config({
  path: "./.env"
});


const PORT = process.env.PORT || 4000
const app = express()


const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { project_name: 'looply', service: 'post' },
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

app.use('/application',ApplicationRoute)

app.use("/", postRoute)


app.listen(PORT, () => {
  console.log(`Post service is running on port ${PORT}`)
})