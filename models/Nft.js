const mongoose = require("mongoose");

const NftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "NFT name is required"],
    },
    jsonHash: { type: String },
    nftType: {
      type: String,
    },
    description: {
      type: String,
    },
    properties: {
      type: [],
    },
    level: {
      type: [],
    },
    stats: {
      type: [],
    },
    isApproved: { type: Boolean, default: false },
    approvedAt: Date,
    approveHash: String,
    blockNumber: Number,
    mintHash: String,
    mintReceipt: {},
    tokenId: String,
    auctionId: {
      type: mongoose.Types.ObjectId,
      ref: "Auction",
      default: null,
    },
    views: { type: Number, default: 0 },
    uploadedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    mintedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    mintedInfo: {
      type: String,
    },
    userInfo: {
      type: String,
    },
    contractType: {
      type: String,
      enum: { values: ["721", "1155"], message: `{VALUE} is not a valid` }, // 721- 'ERC721', 1155- 'ERC1155'
      default: "1155",
    },
    contractAddress: {
      type: String,
    },
    nftStatus: {
      type: Number,
      enum: { values: [1, 2, 3], message: `{VALUE} is not a valid` }, // 1- NFT In wallet,2- NFT on Sale, 3- NFT on Auction
      default: 1,
    },
    price: {
      type: Number,
    },
    quantity: {
      type: Number,
    },
    royalty: {
      type: Number,
    },
    category: {
      type: String,
    },
    collectionName: {
      type: String,
    },
    collectionId: {
      type: mongoose.Schema.ObjectId,
      ref: "Collection",
    },
    cloudinaryUrl: {
      type: String,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    active: {
      type: Boolean,
      default: true,
    },
    nonce: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Nft", NftSchema);
