const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/User");
const Web3Token = require("web3-token");
const sendToken = require("../utils/token");
const cloudinary = require("cloudinary");

exports.register = catchAsyncErrors(async (req, res, next) => {
  const { walletAddress, token } = req.body; //Here we will pass balance and everything from frontend which can be required from wallet Address
  const validAddress = await User.find({ wallet: walletAddress });

  if (validAddress.length) {
    return next(new ErrorHandler("Account Already Exists", 404));
  }
  //Note:We need to add token
  const user = await User.create({ wallet: walletAddress });
  res.status(201).json({
    success: true,
    msg: "Successfully Registered",
    user,
  });
});

exports.login = catchAsyncErrors(async (req, res, next) => {
  const { walletBalance, walletAddress, token } = req.body;
  // console.log(walletAddress);
  // console.log(token);
  const user = await User.findOne({ wallet: walletAddress });
  // console.log(user);
  if (!user) {
    // console.log("hello");
    await User.create({
      wallet: walletAddress,
      walletBalance,
    });
    const newUser = await User.findOne(
      { wallet: walletAddress },
    );
    return sendToken(newUser, 201, res, token);
  }
  else{
    await User.updateOne(
      { wallet: walletAddress },
      { walletBalance }
    );
    const newUser = await User.findOne(
      { wallet: walletAddress },
    );
    return sendToken(newUser, 201, res, token);
  }
  return sendToken(user, 201, res, token);
});

exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.status(200).json({
    success: true,
    message: "Logout Successfully",
  });
});

//This will include everything
exports.updateUserDetails = catchAsyncErrors(async (req, res, next) => {
  console.log(req.file,"heloo")
  let userData = [];
  const { firstName, lastName, username, wallet,insta,linkedIn,twitter,discord } =
    req.body; // will add profile later
    // console.log(req.body, "Updated");
    !!firstName && userData.push(["firstName", `${firstName}`]);
  !!lastName && userData.push(["lastName", `${lastName}`]);
  !!username && userData.push(["username", `${username}`]);
  !!insta && userData.push(["instagram", `${insta}`]);
  !!linkedIn && userData.push(["linkedIn", `${linkedIn}`]);
  !!twitter && userData.push(["twitter", `${twitter}`]);
  !!discord && userData.push(["discord", `${discord}`]);

  if (wallet) {
    const user = await User.find({ wallet: wallet });
    if (user) {
      return next(new ErrorHandler("Wallet Address is Invalid"));
    }
    userData.push(["wallet", `${wallet}`]);
  }

  // console.log(req,"ehsduycsdhj")
  // console.log(req.files.userImage,"heyImage")
  if (req.files.userImage) {
    const user = await User.findById(req.user.userId);
    // console.log(!!user.avatar.public_id,"PublicUrl")
    
    // if (user.avatar.public_id) {
      
      //   const avatarId = user.avatar.public_id;
      //   await cloudinary.v2.uploader.destroy(avatarId);
      //   console.log("Hello")

      // }

    const myCloud = await cloudinary.v2.uploader.upload(req.files.userImage[0].path, {
      folder: "shoogarAvatars",
      width: 150,
      crop: "scale",
    }).catch(e=>{
      console.log(e,"Erro")
    });
    userData.push([
      "avatar",
      {
        public_id: `${myCloud.public_id}`,
        url: `${myCloud.secure_url}`,
      },
    ]);
  }
  if (req.files.bannerImage) {
    const user = await User.findById(req.user.userId);
    // if (user.banner) {
      //   const bannerId = user.banner.public_id;
      //   await cloudinary.v2.uploader.destroy(bannerId);
      // }
    const myCloud = await cloudinary.v2.uploader.upload(req.files.bannerImage[0].path, {
      folder: "shoogarBanner",
      width: 150,
      crop: "scale",
    });
    userData.push([
      "banner",
      {
        public_id: `${myCloud.public_id}`,
        url: `${myCloud.secure_url}`,
      },
    ]);
  }
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    Object.fromEntries(userData),
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(201).json({
    success: true,
    msg: "Updated Successfully",
    userDetails: user,
  });
});

exports.getAllActivities = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.userId)
  if(!user){
    return next(new ErrorHandler("User Does not Exist", 401));
  }
  res.status(201).json({
    success:true,
    activities:user.activity
  })
});

exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User Does not Exist", 401));
  }
  res.status(201).json({
    success: true,
    user,
  });
});

exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.find();
  res.status(201).json({
    user,
  });
});


exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User Does not Exist"));
  }
  await user.remove();
  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
