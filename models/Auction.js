const mongoose = require("mongoose");

const AuctionSchema = new mongoose.Schema(
  {
    auctionType: {
      type: String, //sale, auction
      required: true,
    },
    auctionId: {
      type: Number,
    },
    auctionTimer: {
      type: Date,
      default: 0,
    },
    auctionStatus: {
      type: Number,
      enum: { values: [1, 2, 3, 4], message: `{VALUE} is not a valid` }, // 1- Auction Created,2- Auction Started, 3-Auction Finished, 4- Auction Cancelled
      default: 1,
    },
    auctionStartOn: Date,
    auctionStartTxnHash: String,
    auctionEndedOn: Date,
    auctionEndTxnHash: String,
    auctionCancelledOn: Date,
    auctionCancelTxnHash: String,
    tokenId: Number,
    nftId: {
      type: mongoose.Types.ObjectId,
      ref: "Nft",
    },
    lastBid: {
      type: Number,
      default: 0,
    },
    lastBidId: {
      type: mongoose.Types.ObjectId,
      ref: "Bids",
    },
    highestBidder: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    bidsPlaced: {
      type: Number,
      default: 0,
    },
    startBid: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
    },
    sellerInfo: {
      type: String,
    },
    sellerWallet: {
      type: String,
    },
    sellerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    cloudinaryUrl: {
      type: String,
    },
    category: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    auctionWinner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Auction", AuctionSchema);
