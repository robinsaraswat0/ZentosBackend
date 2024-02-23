const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const Web3Token = require("web3-token");
const User = require("../models/User");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  const { address, body } = Web3Token.verify(token);
  const expiry = body?.["expiration-time"];
  const currTime = new Date().toISOString();

  if (address && expiry > currTime) {
    let user = await User.findOne({
      wallet: { $regex: address, $options: "i" },
    });

    req.user = {
      address: address,
      expiryTime: expiry,
      nonce: body.nonce,
      token: token,
      userId: user._id,
      role: user.userType,
    };
    return next();
  }
  return next(new ErrorHandler("Authentication Invalid", 500));
});
