const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const Nft = require("../models/Nft");
const Collection = require("../models/Collection");
const Mongoose = require("mongoose");
const { ObjectId } = Mongoose.Types;
const NFTStates = require("../models/NFT-States");
const cloudinary = require("cloudinary");
const User = require("../models/User");
const Bids = require("../models/Bids")
const FilterApi = require("../utils/filterApiFeature")



exports.create = catchAsyncErrors(async (req, res, next) => {
  const {
    jsonIpfs,
    name,
    nftType,
    description,
    price,
    tokenId,
    collection,
    category,
    royalty,
    contractType,
    contractAddress,
    // nftImage,
    uploadedBy,
    userInfo,
    mintedInfo,
    level,
    stats,
    properties,
    quantity,
  } = req.body;

  
  // return console.log(JSON.parse(collection)._id,"nftData")
  // console.log(JSON.parse(level),"Level")
  // console.log(collection,"Collection",collection.length)

  const file = req.file;

  // console.log(file,"FileData");
  // console.log(buffer.from(file,'base64'),"Base64")

  const myCloud = await cloudinary.v2.uploader.upload(`${file.path}`, {
    folder: "nfts",
    width: 150,
    crop: "scale",
  }).catch(e=>{
    console.log(e)
  });

  // console.log(req.body, "nftData");
  //we will add user using req.user

  // const nft = await Nft.findOne({
  //   contractAddress,
  //   tokenId,
  // });
  // if (nft) {
  //   return next(new ErrorHandler("NFT already listed", 400));
  // }

  if (!name) {
    return next(new ErrorHandler("Please provide the nft name", 400));
  } else if (!nftType) {
    return next(new ErrorHandler("Please provide the nft type", 400));
  }
  // } else if (!jsonIpfs) {
  //   return next(new ErrorHandler("Please provide the json IPFS", 400));
  // }

  if (collection.length>2) {
    const createObj = {
      userInfo,
      jsonHash: jsonIpfs,
      name,
      description,
      nftType,
      uploadedBy,
      mintedInfo,
      tokenId,
      mintedBy: ObjectId(req.user.userId),
      collectionName : JSON.parse(collection).name,
      collectionId:ObjectId(JSON.parse(collection)._id),
      category,
      cloudinaryUrl: myCloud.secure_url,
      royalty,
      owner: ObjectId(req.user.userId),
      contractType,
      contractAddress,
      level:JSON.parse(level),
      stats:JSON.parse(stats),
      properties:JSON.parse(properties),
      quantity,
    };
    const data = await Nft.create(createObj);
    await NFTStates.create({
      nftId: ObjectId(data._id),
      name,
      state: "Minted",
      from: ObjectId(req.user.userId),
      // to: req.user.wallet,
      date: new Date(),
    });
    await User.findByIdAndUpdate(req.user.userId,    {
      $push: {
        activity: {
          activity: `You have created ${data._id}`,
          timestamp: new Date(),
          // orderId: "1233", // we need to add transactions
        },
      },
    })
    // return res.status(201).json({
    //   success: true,
    //   data,
    // });
  }else{

    const createObj = {
      userInfo,
      jsonHash: jsonIpfs,
      name,
      description,
      nftType,
      uploadedBy,
      mintedInfo,
      tokenId,
      mintedBy: ObjectId(req.user.userId),
      category,
      cloudinaryUrl: myCloud.secure_url,
      royalty,
      owner: ObjectId(req.user.userId),
      contractType,
      contractAddress,
      level:JSON.parse(level),
      stats:JSON.parse(stats),
      properties:JSON.parse(properties),
      quantity,
    };
  
    const data = await Nft.create(createObj);
    await NFTStates.create({
      nftId: ObjectId(data._id),
      name,
      state: "Minted",
      from: ObjectId(req.user.userId),
      // to: req.user.wallet,
      date: new Date(),
    });
    
      await User.findByIdAndUpdate(req.user.userId,    {
        $push: {
          activity: {
            activity: `You have created ${data._id}`,
            timestamp: new Date(),
            // orderId: "1233", // we need to add transactions
          },
        },
      })
  }
  res.status(201).json({
    success: true,
  });
});

exports.getNftByNftId = catchAsyncErrors(async (req, res, next) => {
  const nft = await Nft.findById(req.params.id).populate("mintedBy").populate("auctionId");
  if (!nft) {
    return next(new ErrorHandler("Nft not Found", 404));
  }
  res.status(201).json({
    success: true,
    nft,
  });
});

exports.getNftByOwnerId = catchAsyncErrors(async (req, res, next) => {
  const page = req.query.page ? req.query.page : 1;
  const resultCount = 3
  const resultPerPage = resultCount*page
  const keyword = req.query.keyword ? req.query.keyword : ""

  const nfts = await Nft.find({owner : ObjectId(req.user.userId),name:{$regex:keyword,$options:"i"}}).populate("auctionId").limit(resultPerPage)
  const total = await Nft.countDocuments({owner : ObjectId(req.user.userId),name:{$regex:keyword,$options:"i"}})
  // console.log(nfts,"nfts")
  if (!nfts) {
    return next(new ErrorHandler("Nft not Found", 404));
  }
  res.status(201).json({
    success: true,
    nfts,
    total,
    resultCount
  });
});

exports.getAllNfts = catchAsyncErrors(async (req, res, next) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const resultCount = 3
  const resultPerPage = resultCount*page;
  // let startIndex = (page - 1) * resultPerPage;

  let nftFilter = [];
  const price = req.query.price;
  const keyword = req.query.keyword;
  const status = Number(req.query.status);
  const bundle = req.query.bundle;
  const single = req.query.single;
  const collection = req.query.collection;
  const categories = req.query.categories;

  if (price) {
    let priceString = JSON.stringify(price);
    priceString = priceString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (key) => `$${key}`
    );
    // console.log(priceString,"Hello")
    priceString = JSON.parse(priceString);
    for (let key in priceString) {
      priceString[key] *= 1;
    }
    // console.log(priceString,"priceString")
    nftFilter.push({ price: priceString });
  }
  !!keyword &&
    nftFilter.push({
      name: { $regex: keyword, $options: "i" },
    });

  !!bundle &&
    nftFilter.push({
      quantity: { $gte: 2 },
    });
  !!single &&
    nftFilter.push({
      quantity: { $eq: 1 },
    });
  !!categories &&
    nftFilter.push({
      category: { $in: categories },
    });

    status ?   nftFilter.push({
      nftStatus: status,
    }):
  nftFilter.push({
    nftStatus: {$gte:2},
  })

  const collectionLookup = {
    $lookup: {
      from: "collections",
      localField: "collectionId",
      foreignField: "_id",
      as: "collectionDetails",
    },
  };

  const auctionLookup = {
    $lookup:{
      from:"auctions",
      localField:"auctionId",
      foreignField:"_id",
      as:"auctionDetails"
    }
  }


  let pipeline = [];

  if (nftFilter.length) {
    const nft = { $match: { $and: nftFilter } };
    pipeline.push(nft);
  }

  pipeline.push(collectionLookup);
  if (collection) {
    pipeline.push({
      $match: { $and: [{ "collectionDetails.name": { $in: collection } }] },
    });
  }

  pipeline.push(auctionLookup);
  pipeline.push({
    $unwind:"$auctionDetails"
  })
  // if(status===3){
  //   pipeline.push({
  //     $match:{$or:[{$and:[{"auctionDetails.auctionTimer":{$exists:true}},{"auctionDetails.auctionTimer":{$gt: new Date()}}]},{"auctionDetails.auctionTimer":{$exists:false}}]}
  //   })
  //   }

  const paging = {
    $facet: {
      metadata: [
        {
          $count: "total",
        },
      ],
      data: [
        // {
        //   $skip: startIndex,
        // },
        {
          $limit: resultPerPage,
        },
      ],
    },
  };
  // pipeline.push(paging);
  // console.log(pipeline)

  const nfts = await Nft.aggregate(pipeline);
  let filtered = nfts.filter(value=>value.auctionDetails.auctionType==="auction" ? new Date(value.auctionDetails.auctionTimer)  > new Date() : value)

  const total=filtered.length

  filtered = filtered.slice(0,resultPerPage)
  // console.log(nfts,"HeloAuction")
  if (!filtered.length) {
    return next(new ErrorHandler("No Nft Found", 404));
  }
  // const [nftData] = nfts;
  // console.log(nftData.data."HelloData")
  res.status(201).json({
    success: true,
    filtered,
    total,
    resultCount
  });
});

exports.getNftByCollection = catchAsyncErrors(async (req, res, next) => {
  const filterApi = new FilterApi(Nft,req,"collection").filter()
  const filtered = await filterApi.query
  // const nfts = await Nft.find({
  //   collectionId: Mongoose.Types.ObjectId(req.params.id),
  // });
  // if (!nfts) {
  //   return next(new ErrorHandler("Collection Does not contain Nft",404));
  // }
  res.status(201).json({
    success: true,
    filtered,
  });
});

exports.getUserCreatedNft = catchAsyncErrors(async(req,res,next) =>{

  const page = req.query.page ? req.query.page : 1;
  const resultCount = 3
  const resultPerPage = resultCount*page
  const keyword = req.query.keyword ? req.query.keyword : ""
  // console.log(keyword,"HeyKeywordd")

  const nfts = await Nft.find({mintedBy:ObjectId(req.user.userId),name:{$regex:keyword,$options:"i"}}).limit(resultPerPage)
  const total = await Nft.countDocuments({mintedBy:ObjectId(req.user.userId),name:{$regex:keyword,$options:"i"}})
  // console.log(total,"total")
  if(!nfts){
    return next(new ErrorHandler("Nfts not Found",404))
  }
  // const total = nfts.length
  // nfts.limit(resultPerPage)
  res.status(201).json({
    success:true,
    nfts,
    resultCount,
    total
  })
})

exports.getNftOwnersHistory = catchAsyncErrors(async (req, res, next) => {
  const {nftId} = req.body
  // console.log(req.body,"History")
  const nftStates = await NFTStates.find({nftId:ObjectId(nftId)},{from:1,to:1,_id:0}).populate("from").populate("to")

  if(!nftStates){
    return next(new ErrorHandler("No Owner History",404));
  }

  let Owners=[]
  nftStates.map(state => {
    state.to ? Owners.push(state.to) : Owners.push(state.from)
  })

  res.status(201).json({
    success:true,
    Owners
  })
});

exports.getUserOffers = catchAsyncErrors(async(req,res,next) => {
  // const auctionId = await Nft.find({owner:ObjectId(req.user.userId),nftStatus:3})
  const offers = await Bids.aggregate([
      {
          $lookup: {
              from: "nfts",
              // localField: "nftId",
              // foreignField: "_id",
              let: { auctionId: "$auctionId", nftId: "$nftId" },
              pipeline:[
                {$match:
                  // {$and:[{"_id":"$auctionId"}]}
                {  $expr:{
                    $and:[
                      { $eq: [ "$$nftId", "$_id" ] },
                      { $eq: [ "$$auctionId", "$auctionId" ] },
                    ]
                  }}
                }
              ],
              as: "nftsData",
          },
      },
      {$unwind:"$nftsData"},
      {
          $match: {
              $and: [
                  { "nftsData.owner": ObjectId(req.user.userId) },
                  { "nftsData.nftStatus": 3 },
              ],
          },
      },
      {
          $lookup: {
              from: "users",
              localField: "bidder",
              foreignField: "_id",
              as: "bidderDetails",
          },
      },
      {$unwind:"$bidderDetails"},
      {$project:{"bidderDetails":1,'nftsData':1,bidValue:1,createdAt:1}}
  ])
  if(!offers){
    return next(new ErrorHandler("No Offers Yet"),404)
  }

  res.status(201).json({
    success:true,
    offers
  })
})
