const mongoose = require("mongoose");
const validator = require("validator");

const BidSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    nftId: {
      type: mongoose.Types.ObjectId,
      ref: "Nft",
      required: true,
    },
    bidValue: {
      type: Number,
      required: [true, "Please enter the bid value"],
    },
    bidder: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    username: String,
    bidCurrency: {
      type: String,
    },
    bidHash: {
      type: String,
    },
    bidSuccess: {
      type: Boolean,
    },
    chain: {
      type: String,
    },
    bidObj: {},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bids", BidSchema);
