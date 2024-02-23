const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const ErrorHandler = require("../utils/errorHandler")
const Auction = require("../models/Auction")
const Nft = require("../models/Nft")
const Bids = require("../models/Bids")
const Mongoose = require("mongoose")
const { ObjectId } = Mongoose.Types
const NFTStates = require("../models/NFT-States");
const User = require("../models/User");
const FilterApi = require("../utils/filterApiFeature")

exports.create = catchAsyncErrors(async (req, res, next) => {
    const {
        nftId,
        startBid,
        auctionType,
        auctionHash,
        tokenId,
        duration,
        auctionId,
        cloudinaryUrl,
    } = req.body
    var finishTime = new Date().getTime()
    //Will add user
    if (!nftId) {
        return next(new ErrorHandler("Please provide the NFT id", 400))
    } else if (!startBid) {
        return next(new ErrorHandler("please provide the start bid", 400))
    } else if (!auctionType) {
        return next(new ErrorHandler("please provide the auction type", 400))
    } else if (!auctionHash) {
        return next(new ErrorHandler("please provide the auction hash", 400))
    } else if (tokenId != 0 && !tokenId) {
        return next(new ErrorHandler("Please provide the token id", 400))
    } else {
        finishTime = new Date(finishTime+duration*1000)
        // console.log(auctionTimer.toString());
        // const dateString = `${auctionTimer.getUTCDate} ++ ${auctionTimer.getUTCMonth + 1} ++ ${auctionTimer.getUTCFullYear} ++ ${auctionTimer.getUTCHours} ++ ${auctionTimer.getUTCMinutes}`
        const nftOne = await Nft.findOne({ _id: nftId })
        let createObj = {
            nftId,
            startBid,
            auctionType,
            auctionTimer:finishTime,
            auctionStartOn: new Date(),
            auctionStartTxnHash: auctionHash,
            tokenId,
            // highestBidder: req.user.userId,
            auctionStatus: 2,
            sellerWallet: req.user.wallet,
            sellerId: ObjectId(req.user.userId),
            // category: nftOne.category,
            auctionId
        }
        const auction = await Auction.create(createObj)
        const nft = await Nft.updateOne(
            {
                _id: nftId,
            },
            {
                nftStatus: 3,
                auctionId: auction._id,
                price:startBid
            }
        )
        await User.findByIdAndUpdate(req.user.userId,    {
            $push: {
              activity: {
                activity: `You have created an Auction of ${nftId} for price ${startBid}`,
                timestamp: new Date(),
                // orderId: "1233", // we need to add transactions
              },
            },
          })
        res.status(201).json({
            success: true,
            auction,
            nft,
        })
    }
})

exports.sell = catchAsyncErrors(async (req, res, next) => {
    const {
        nftId,
        startBid,
        auctionType,
        auctionHash,
        tokenId,
        auctionId,
        cloudinaryUrl,
    } = req.body
    if (!nftId) {
        return next(new ErrorHandler("Please provide the NFT id", 400))
    } else if (!startBid) {
        return next(new ErrorHandler("please provide the start bid", 400))
    } else if (!auctionType) {
        return next(new ErrorHandler("please provide the auction type", 400))
    } else if (!auctionHash) {
        return next(new ErrorHandler("please provide the auction hash", 400))
    } else if (tokenId != 0 && !tokenId) {
        return next(new ErrorHandler("Please provide the token id", 400))
    } else {
        const nftOne = await Nft.findOne({ _id: nftId })
        let createObj = {
            nftId,
            startBid,
            auctionType,
            auctionStartOn: new Date(),
            auctionStartTxnHash: auctionHash,
            tokenId,
            auctionStatus: 2,
            sellerWallet: req.user.wallet,
            sellerId: ObjectId(req.user.userId),
            cloudinaryUrl,
            category: nftOne.category,
            auctionId
        }
        const auction = await Auction.create(createObj)
        // console.log(Number(auction._id))
        const nft = await Nft.updateOne(
            {
                _id: nftId,
            },
            {
                nftStatus: 2,
                auctionId: auction._id,
                price:startBid
            }
        )

        await User.findByIdAndUpdate(req.user.userId,    {
            $push: {
              activity: {
                activity: `You have successfully put ${nftId} on Sale for price ${startBid}`,
                timestamp: new Date(),
                // orderId: "1233", // we need to add transactions
              },
            },
          })
        
        res.status(201).json({
            success: true,
            auction,
        })
    }
})

exports.buy = catchAsyncErrors(async (req, res, next) => {
    const { auctionId, nftId, endAuctionHash } = req.body
    //   const userId = req.user.userId;
    const auction = await Auction.findByIdAndUpdate(
        auctionId,
        {
            active: false,
            auctionStatus: 3,
            auctionEndedOn: new Date(),
            auctionEndTxnHash: endAuctionHash,
        },
        { new: true, runValidators: true, useFindAndModify: false }
    )
    const nftData = await Nft.findById(nftId)
    await NFTStates.create({
        nftId: ObjectId(nftId),
        state: "Transfer",
        from: ObjectId(nftData.owner),
        to: req.user.userId,
        date: new Date(),
      });
    const nft = await Nft.updateOne(
        {
            _id: nftId,
        },
        {
            actionId: null,
            owner: ObjectId(req.user.userId),
            nftStatus: 1,
        }
    )
    //Will Have to think about Sale and States

    await User.findByIdAndUpdate(req.user.userId,    {
        $push: {
          activity: {
            activity: `You have successfully bought ${nftId}`,
            timestamp: new Date(),
            // orderId: "1233", // we need to add transactions
          },
        },
      })

    res.status(201).json({
        success: true,
        auction,
    })
})

exports.getAllSale = catchAsyncErrors(async (req, res, next) => {
    const skip = Math.max(0, req.params.skip)
    const auctions = await Auction.find({
        auctionType: "Sale",
        auctionStatus: 2,
    })
    if (auctions.length < skip + 30) {
        const limit = Math.max(0, auctions.length - skip)
        const data = await Auction.find({
            auctionType: "Sale",
            auctionStatus: 2,
        })
            .limit(limit)
            .skip(skip)
            .sort([["tokenId", -1]])
            .populate("nftId")

        res.status(201).json({
            data: data,
            totalAuctions: auctions.length,
            msg: "Done",
        })
    } else {
        const data = await Auction.find({
            auctionType: "Sale",
            auctionStatus: 2,
        })
            .limit(30)
            .skip(skip)
            .sort([["tokenId", -1]])
            .populate("nftId")

        res.status(201).json({ data: data, totalAuctions: auctions.length })
    }
})

exports.getAllAuction = catchAsyncErrors(async (req, res, next) => {
    const page = req.query.page ? Number(req.query.page) : 1
    const resultPerPage = 1*page

    const auctions = await Auction.find({
        auctionType: "auction",
        auctionStatus: 2,
        // active: true,
    }).limit(resultPerPage)

    if(!auctions.length){
        return next(new ErrorHandler("No Result Found",404))
    }

    res.status(201).json({
        success:true,
        auctions,
        total:auctions.length
    })
})

exports.getOnSaleNftByUserId = catchAsyncErrors(async(req,res,next) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const resultCount = 3
    const resultPerPage = resultCount*page;
  // let startIndex = (page - 1) * resultPerPage;

  const filterApi = new FilterApi(Nft,req,"onSale").filter()
  let nfts = await filterApi.query

  const total = nfts.length

  filterApi.pagination(resultPerPage)

  nfts = await filterApi.query

//   let nftFilter = [];
//   const price = req.query.price;
//   const keyword = req.query.keyword;
//   const status = Number(req.query.status);
//   const bundle = req.query.bundle;
//   const single = req.query.single;
//   const collection = req.query.collection;
//   const categories = req.query.categories;

//   if (price) {
//     let priceString = JSON.stringify(price);
//     priceString = priceString.replace(
//       /\b(gt|gte|lt|lte)\b/g,
//       (key) => `$${key}`
//     );
//     // console.log(priceString,"Hello")
//     priceString = JSON.parse(priceString);
//     for (let key in priceString) {
//       priceString[key] *= 1;
//     }
//     // console.log(priceString,"priceString")
//     nftFilter.push({ price: priceString });
//   }

//   nftFilter.push({
//     owner:ObjectId(req.user.userId)
//   })

//   !!keyword &&
//     nftFilter.push({
//       name: { $regex: keyword, $options: "i" },
//     });

//   !!bundle &&
//     nftFilter.push({
//       quantity: { $gte: 2 },
//     });
//   !!single &&
//     nftFilter.push({
//       quantity: { $eq: 1 },
//     });
//   !!categories &&
//     nftFilter.push({
//       category: { $in: categories },
//     });

//     status ?   nftFilter.push({
//       nftStatus: status,
//     }):
//   nftFilter.push({
//     nftStatus: {$gte:2},
//   })

//   const collectionLookup = {
//     $lookup: {
//       from: "collections",
//       localField: "collectionId",
//       foreignField: "_id",
//       as: "collectionDetails",
//     },
//   };

//   let pipeline = [];

//   if (nftFilter.length) {
//     const nft = { $match: { $and: nftFilter } };
//     pipeline.push(nft);
//   }

//   pipeline.push(collectionLookup);
//   if (collection) {
//     pipeline.push({
//       $match: { $and: [{ "collectionDetails.name": { $in: collection } }] },
//     });
//   }

//   const paging = {
//     $facet: {
//       metadata: [
//         {
//           $count: "total",
//         },
//       ],
//       data: [
//         // {
//         //   $skip: startIndex,
//         // },
//         {
//           $limit: resultPerPage,
//         },
//       ],
//     },
//   };
//   pipeline.push(paging);
//   // console.log(pipeline)
// //   console.log(pipeline)

//   const nfts = await Nft.aggregate(pipeline);
  if (!nfts.length) {
    return next(new ErrorHandler("No Nft Found", 404));
  }
  const [nftData] = nfts;
  res.status(201).json({
    success: true,
    nfts,
    resultCount,
    total
  });
    // const nfts = await Nft.find({owner:ObjectId(req.user.userId),nftStatus:{$gte:2}})
    // if(!nfts.length){
    //     return next(new ErrorHandler("Nft not Found",404))
    // }
    // res.status(201).json({
    //     success:true,
    //     nfts
    // })
})

exports.getAllExplore = catchAsyncErrors(async (req, res, next) => {
    const sort = req.params.sort
    const skip = Math.max(0, req.params.skip)
    const auctions = await Auction.find({
        auctionStatus: 2,
        active: true,
    })
    const count = await Auction.countDocuments({
        auctionStatus: 2,
        active: true,
    })
    // console.log("c", auctions.length, count)
    if (auctions.length < skip + 30) {
        const limit = Math.max(0, auctions.length - skip)
        const data = await Auction.find({
            auctionStatus: 2,
            active: true,
        })
            .limit(limit)
            .skip(skip)
            .sort(JSON.parse(sort))
            .populate("nftId")
        res.status(201).json({
            data: data,
            totalAuctions: auctions.length,
            msg: "Done",
        })
    } else {
        const data = await Auction.find({
            auctionStatus: 2,
            active: true,
        })
            .limit(30)
            .skip(skip)
            .sort(JSON.parse(sort))
            .populate("nftId")
        res.status(201).json({ data: data, totalAuctions: auctions.length })
    }
})

exports.getRecentPurchased = catchAsyncErrors(async (req, res, next) => {
    const data = await Auction.find({
        auctionStatus: 3,
    })
        .limit(20)
        .sort([["createdAt", -1]])
        .populate("nftId")
    if (data) {
        res.status(200).json({ data })
    } else {
        return next(new ErrorHandler("Data not found", 400))
    }
})

exports.getAuctionById = catchAsyncErrors(async (req, res, next) => {
    const auctionId = req.params.auctionId
    const auction = await Auction.findById({
        _id: ObjectId(auctionId),
    }).populate("nftId").populate("highestBidder")

    res.status(201).json({
        success: true,
        auction,
    })
})

exports.getAuctionByNftId = catchAsyncErrors(async (req, res, next) => {
    const NftId = req.params.NftId
    const auction = await Auction.findOne({
        nftId: NftId,
        auctionStatus: 2,
    })
    if (!auction) {
        return next(new ErrorHandler("Invalid Id", 400))
    }
    res.status(201).json({
        success: true,
        auction,
    })
})

exports.startAuction = catchAsyncErrors(async (req, res, next) => {
    const { auctionId, auctionHash } = req.body
    const auctionData = await Auction.findById(auctionId)
    // console.log(auctionData)
    const auction = await Auction.updateOne(
        { _id: ObjectId(auctionId) },
        {
            auctionStatus: 2,
            auctionStartOn: new Date(),
            auctionStartTxnHash: auctionHash,
        }
    )
    res.status(201).json({
        success: true,
        auction,
    })
})

exports.placeBid = catchAsyncErrors(async (req, res, next) => {
    const { auctionId, nftId, bidValue, bidHash, bidSuccess, bidObject } =
        req.body
    const auctionData = await Auction.findOne({
        _id: ObjectId(auctionId),
        auctionStatus: 2,
    })
    let bidNumber = 1
    // console.log(auctionData?.bidsPlaced)
    if (auctionData?.bidsPlaced) {
        // const lastBid = await getAuctionBids(auctionId, nftId, 1);
        const lastBidId = auctionData.lastBidId
        if (lastBidId) {
            const data = await Bids.findOne({
                _id: ObjectId(lastBidId),
            })
            console.log("data----------->", data)
        }
        bidNumber = auctionData.bidsPlaced + 1
    }

    if (auctionId != 0 && !auctionId) {
        return next(new ErrorHandler("Please provide the auction id", 400))
    } else if (!nftId) {
        return next(new ErrorHandler("Please provide the nft id", 400))
    } else if (!bidValue) {
        return next(new ErrorHandler("Please provide the bid value", 400))
    } else if (!bidHash) {
        return next(new ErrorHandler("Please provide the bid hash", 400))
    } else if (!bidSuccess) {
        return next(
            new ErrorHandler(
                "Please provide wheather bid is success or not",
                400
            )
        )
    }
    // else if (bidObject) {
    //   return next(
    //     new ErrorHandler("Please provide the bid transaction Object", 400)
    //   );
    // }
    else {
        const auction = await Auction.findOne({
            _id: auctionId,
            auctionStatus: 2,
        })
        // if (auction.auctionStatus === 1)
        //   return next(new ErrorHandler("Auction not started yet", 400));
        // if (auction.auctionStatus === 3)
        //   return next(new ErrorHandler("Auction already ended", 400));
        // if (auction.auctionStatus === 4)
        //   return next(new ErrorHandler("Auction already cancelled", 400));

        const bidder = req.user.userId
        let createObj = {
            auctionId: ObjectId(auctionId),
            nftId: ObjectId(nftId),
            bidValue,
            bidder,
            bidHash,
            bidSuccess,
            // bidObj: bidObject,
        }

        var bid = await Bids.create(createObj)
        await Auction.updateOne(
            { _id: auctionId },
            {
                bidsPlaced: bidNumber,
                lastBidId: bid._id,
                lastBid: bidValue,
                highestBidder: bidder,
            }
        )

        res.status(201).json({
            success: true,
            bid,
        })
    }
})

exports.getAuctionBids = catchAsyncErrors(async (req, res, next) => {
    const { auctionId, nftId, bidsLimit } = req.body
    // console.log(auctionId, nftId)
    const pipeline = [
        {
            $match: {
                $and: [
                    // { auctionId: ObjectId(auctionId) },
                    {
                        nftId: ObjectId(nftId),
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "bidder",
                foreignField: "_id",
                as: "userDetails",
            },
        },
        { $sort: { bidValue: -1 } },
        { $limit: 3 },
    ]
    const auctionBids = await Bids.find({ auctionId, nftId })
        .populate("bidder nftId")
        .limit(5)
        .sort({ bidValue: -1 })
    if (auctionBids.length) {
        return res.status(201).json({
            success: true,
            auctionBids,
        })
    } else {
        return next(new ErrorHandler("Auction History not Found", 404))
    }
})

exports.endAuction = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.userId;
    const { nftId, auctionId, endAuctionHash, userInfo } = req.body
    console.log(nftId)
    if (!nftId) {
        return next(new ErrorHandler("Please provide the nft id", 400))
    } else if (!auctionId) {
        return next(new ErrorHandler("Please provide the auction id", 400))
    } else if (!endAuctionHash) {
        return next(
            new ErrorHandler("Please provide the transaction hash", 400)
        )
    } else {
        const auction = await Auction.findOne({ _id: auctionId})
        if (auction.auctionStatus === 3)
            return next(new ErrorHandler("Auction already ended", 400))
        if (auction.auctionStatus === 4)
            return next(new ErrorHandler("Auction already cancelled", 400))

        // const auctionBids = await getAuctionBids(auctionId, nftId, 0);
        const lastBidId = auction.lastBidId
        const nft = await Nft.findOne({ _id: nftId })
        if (auction.bidsPlaced) {
            const bid = await Bids.findOne({
                _id: ObjectId(lastBidId),
            })

            const auctionWinner = bid.bidder
            await Auction.updateOne(
                { _id: auctionId},
                {
                    auctionStatus: 3,
                    auctionEndedOn: new Date(),
                    auctionEndTxnHash: endAuctionHash,
                    auctionWinner: auctionWinner,
                }
            )

            const user = await User.findOne({wallet:userInfo})

            await NFTStates.create({
                nftId: nftId,
                state: "End Auction",
                from: user._id,
                to: ObjectId(auctionWinner),
            })

            await Nft.updateOne(
                {
                    _id: nftId,
                },
                {
                    owner: auctionWinner,
                    userInfo,
                    nftStatus: 1,
                }
            )
        } else {

            await Auction.updateOne(
                { _id: auctionId },
                {
                    auctionStatus: 3,
                    auctionEndedOn: new Date(),
                    auctionEndTxnHash: endAuctionHash,
                }
            )

            await Nft.updateOne(
                {
                    _id: nftId,
                },
                {
                    owner: userId,
                    nftStatus: 1,
                }
            )
        }

        res.status(200).json("Auction Ended")
    }
})

exports.cancelAuction = catchAsyncErrors(async (req, res, next) => {
    // const storefront = req.storefront.id;
    const { auctionId, nftId, transactionHash } = req.body
    const auctionDetails = await Auction.findOne({
        _id: auctionId,
    })
    // console.log(auctionDetails._id)
    if (auctionDetails.auctionStatus === 4)
        return next(new ErrorHandler("Auction already cancelled", 400))
    if (auctionDetails.auctionStatus === 3)
        return next(new ErrorHandler("Can't cancel the finished auction", 400))
    if (auctionDetails.auctionStatus === 1)
        return next(new ErrorHandler("Auction not started yet", 400))

    const auction = await Auction.updateOne(
        {
            _id: auctionId,
        },
        {
            auctionCancelledOn: new Date(),
            auctionCancelTxnHash: transactionHash,
            auctionStatus: 4,
        }
    )

    const nft = await Nft.updateOne(
        {
            _id: nftId,
        },
        {
            owner: req.user.userId,
            nftStatus: 1,
        }
    )
    res.status(200).json("Auction Cancelled")
})
