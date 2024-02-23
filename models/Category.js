const mongoose = require("mongoose")

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique:[true,"Categoy already exist"]
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
)

module.exports = new mongoose.model("Categories", CategorySchema)
