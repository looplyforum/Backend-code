import express from "express"
import cors from "cors"
import morgan from "morgan"


const app = express()

app.use(cors())
app.use(morgan("dev"))
app.use(express.json())

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

const PORT = process.env.PORT || 4000

app.listen(PORT,  () => {
  console.log(`Auth service is running on port ${PORT}`)
})