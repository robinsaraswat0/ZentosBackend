const app = require("./app")
const connectDatabase = require("./config/database")
const dotenv = require("dotenv")
const cloudinary = require("cloudinary")

//Handling Uncaught Exceptions
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err}`)
    console.log("Shutting the server due to UnCaught Exception")
    process.exit(1) // to get exit
})

//config
dotenv.config({ path: "./config/.env" })

//connecting to Database
connectDatabase()

// console.log(__dirname, "MongoURI")

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const server = app.listen(process.env.PORT, (req, res) => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
})
