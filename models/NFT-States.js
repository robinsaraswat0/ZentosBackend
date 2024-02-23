const mongoose = require("mongoose");

const NftStateSchema = new mongoose.Schema(
  {
    nftId: {
      type: mongoose.Types.ObjectId,
      ref: "Nft",
      required: true,
    },
    state: { type: String, required: true }, // Mint, Transfer
    from: { 
      type: mongoose.Types.ObjectId,
      ref:"User",
      required: true }, // Public address
    to: { 
      type: mongoose.Types.ObjectId,
      ref: "User",
     }, // Public Address
  },
  { timestamps: true }
);

module.exports = mongoose.model("NftStates", NftStateSchema);
