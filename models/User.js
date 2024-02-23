const mongoose = require("mongoose");
const validator = require("validator");
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      minlength: 2,
      maxlength: 50,
    },
    username: {
      type: String,
      unique: [true, "username has already taken"],
      minlength: [3, "Username should have at least 3 characters"],
      maxlength: [15, "Username cannot have more than 15 characters"],
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    banner: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    userType: {
      type: Number,
      enum: [1, 2, 3], //1- Non Crypto & 2- Crypto User
      default: 1,
    },
    isAdmin: { type: Boolean, default: false },
    verificationToken: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedOn: Date,
    bio: {
      type: String,
    },
    linkedIn: {
      type: String,
    },
    instagram: {
      type: String,
    },
    facebook: {
      type: String,
    },
    twitter: {
      type: String,
    },
    discord: {
      type: String,
    },
    wallet: {
      type: String,
    },
    activity: {
      type: [],
    },
    backgroundUrl: String,
    balances: { type: Number, default: 0 },
    walletBalance: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    nonce: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
