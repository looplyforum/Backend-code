import express from "express"
import cors from "cors"
import morgan from "morgan"
import { v2 as cloudinary } from 'cloudinary';
import { config } from "dotenv";

import uploadRoute from "./routes/upload.route"


config({
    path: "./.env"
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 4000
const app = express()

app.use(cors())
app.use(morgan("dev"))
app.use(express.json())

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})


app.use("/" , uploadRoute)


app.listen(PORT,  () => {
  console.log(`Auth service is running on port ${PORT}`)
})