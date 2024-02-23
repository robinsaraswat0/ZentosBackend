const express = require("express")
const app = express()
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
const errorMiddleware = require("./middleware/error")
const bodyParser = require("body-parser")
// const fileUpload = require("express-fileupload")
const cors = require("cors")

//Config
dotenv.config({ path: "./config/config.env" })
// dotenv.config()

console.log(process.env.CORS_URL)
app.use(
    cors({
        origin: process.env.CORS_URL,
        credentials: true,
    })
)

app.use(express.json({ limit: "50mb" }))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))
// app.use(fileUpload())

//Route Imports
const user = require("./routes/userRoute")
const nft = require("./routes/nftRoute")
const collection = require("./routes/collectionRoute")
const auction = require("./routes/auctionRoute")
const pinata = require("./routes/pinataRoute")
const category = require("./routes/categoryRoute")

app.use("/api/v1", user)
app.use("/api/v1", nft)
app.use("/api/v1", collection)
app.use("/api/v1", auction)
app.use("/api/v1", pinata)
app.use("/api/v1", category)


// Middleware for Error
app.use(errorMiddleware)

module.exports = app
