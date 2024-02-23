const Mongoose = require("mongoose")
const { ObjectId } = Mongoose.Types;

class FilterApi {
    constructor(query,req,source) {
        this.query = query
        this.queryStr = req.query
        this.params = req.params
        this.source = source
        this.req = req
    }
    filter() {
        console.log(this.source)
        let filter = []
        const price = this.queryStr.price
        const keyword = this.queryStr.keyword
        const status = Number(this.queryStr.status)
        const bundle = this.queryStr.bundle
        const single = this.queryStr.single
        const collection = this.queryStr.collection
        const categories = this.queryStr.categories

        // console.log(!!this.params.id)
        this.params.id && filter.push({
            collectionId:ObjectId(this.params.id)
        })

        this.source==="onSale" && this.req.user && filter.push({
            owner:ObjectId(this.req.user.userId)
        })

        if (price) {
            let priceString = JSON.stringify(price)
            priceString = priceString.replace(
                /\b(gt|gte|lt|lte)\b/g,
                (key) => `$${key}`
            )
            // console.log(priceString,"Hello")
            priceString = JSON.parse(priceString)
            for (let key in priceString) {
                priceString[key] *= 1
            }
            // console.log(priceString,"priceString")
            filter.push({ price: priceString })
        }
        !!keyword &&
            filter.push({
                name: { $regex: keyword, $options: "i" },
            })
            !!bundle &&
            filter.push({
              quantity: { $gte: 2 },
            });
        !!single &&
        filter.push({
            quantity: { $eq: 1 },
        });
        !!categories &&
        filter.push({
            category: { $in: categories },
        });
        
        if(this.source==="collection"){
            status && filter.push({
                nftStatus: status,
            })
        }else{
            status ? filter.push({
                nftStatus: status,
            }):
              filter.push({
                nftStatus: {$gte:2},
              })
        }

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
        
        // // console.log(filter,"HelloFilter")
        let pipeline = [];
        console.log(filter)

        if (filter.length) {
            const nft = { $match: { $and: filter } };
            pipeline.push(nft);
        }

        if (collection) {
            pipeline.push(collectionLookup);
            pipeline.push({
            $match: { $and: [{ "collectionDetails.name": { $in: collection } }] },
            });
        }

        if(this.source==="marketPlace"){

            pipeline.push(auctionLookup);
            pipeline.push({
                $unwind:"$auctionDetails"
            })
        }
        console.log(pipeline)
        // console.log(this.query.aggregate())
        this.query = this.query.aggregate(pipeline)
        return this
    }
    pagination(resultPerPage) {
        // const currentPage = Number(this.queryStr.page) || 1;
    
        // const skip = resultPerPage * (currentPage - 1);
    
        this.query = this.query.limit(resultPerPage);
    
        return this;
      }
}

module.exports = FilterApi
