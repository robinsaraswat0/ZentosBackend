const Collection = require("../models/Collection")
const Mongoose = require("mongoose")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const ApiFeatures = require("../utils/apiFeature")
const { ObjectId } = Mongoose.Types;
const cloudinary = require("cloudinary")

exports.create = catchAsyncErrors(async(req,res,next) =>{
  const {name,jsonIpfs,token,description,category,extLink} = req.body
  const data = await Collection.find({name:{$regex:name.replace(/\s+/g, ""),$options:"xi"}})
  if(data.length){
      return next(new ErrorHandler("Already Exists",400))
  }

  const bannerCloud = await cloudinary.v2.uploader.upload(req.files.bannerImage[0].path,{
    folder:"shoogarCollectionBanners",
    width: 150,
    crop: "scale",
  }).catch(e=>{
    console.log(e)
  })

  // console.log(bannerCloud,"BannerCloud")

  const logoCloud = await cloudinary.v2.uploader.upload(req.files.collectionLogo[0].path,{
    folder:"shoogarCollectionLogos",
    width:150,
    crop:"scale"
  })

  const collection = await Collection.create({
      name,
      jsonHash:jsonIpfs,
      tokenId:token,
      description,
      extLink,
      category,
      profileUrl:logoCloud.secure_url,
      backgroundUrl:bannerCloud.secure_url,
      mintedBy:ObjectId(req.user.userId),
      ownerId:ObjectId(req.user.userId)
  })
  res.status(201).json({
      success:true,
      collection
  })
})

exports.getAllCollections = catchAsyncErrors(async (req, res, next) => {
    const apiFeature = new ApiFeatures(Collection.find().populate("ownerId"),req.query).search()
    const collection = await apiFeature.query
    if(!collection.length){
      return next(new ErrorHandler("No Collection Found",404))
    }
    res.status(201).json({
      success:true,
      collections:collection
    })
  });

exports.userCollections = catchAsyncErrors(async(req,res,next)=>{
  const collections = await Collection.find({ownerId:ObjectId(req.user.userId)}).populate("ownerId")
  if(!collections){
    return next(new ErrorHandler("No Collection Found",404))
  }
  res.status(201).json({
    success:true,
    collections
  })
})

exports.getCollectionDetails = catchAsyncErrors(async(req,res,next)=>{
  const collectionDetails = await Collection.findById(req.params.id)
  if(!collectionDetails){
    return next(new ErrorHandler("Not Found",404))
  }
  res.status(201).json({
    success:true,
    collectionDetails
  })
})

