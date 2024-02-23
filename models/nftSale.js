const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    sellerAccount: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    winnerAccount: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    nft: {
      type: mongoose.Schema.ObjectId,
      ref: "Nft",
    },
    quantity: {
      type: Number,
    },
    currency: {
      type: String,
      default: "ETH",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Sale", saleSchema);
