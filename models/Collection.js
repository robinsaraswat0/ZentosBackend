const mongoose = require("mongoose");

const NftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    jsonHash:{
      type:String,
    },
    description: {
      type: String,
    },
    mintedBy:{
      type:mongoose.Types.ObjectId,
      ref:"User"
    },
    extLink:String,
    ownerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    tokenId:{
      type:String
    },
    category:{
      type:String
    },
    backgroundUrl: {
      type: String,
    },
    profileUrl: {
      type: String,
    },
    total: {
      type: Number,
    },
    floorPrice: {
      type: Number,
    },
    volumeTraded: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
    discord: {
      type: String,
    },
    instagram: {
      type: String,
    },
    twitter: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Collection", NftSchema);
