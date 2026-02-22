import express from "express"
import cors from "cors"
import morgan from "morgan"
import {config} from "dotenv"
import notificationRoute from "./routes/notification.route"

config({
    path: "./.env"
});

const PORT = process.env.PORT || 4000
const app = express()

app.use(cors())
app.use(morgan("dev"))
app.use(express.json())

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

app.use("/" , notificationRoute)



app.listen(PORT,  () => {
  console.log(`Auth service is running on port ${PORT}`)
})