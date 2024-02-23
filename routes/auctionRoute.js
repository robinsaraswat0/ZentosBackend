const express = require("express");
const router = express.Router();
const {
  create,
  sell,
  buy,
  getAllSale,
  getAllAuction,
  getAllExplore,
  getAuctionById,
  getAuctionByNftId,
  startAuction,
  placeBid,
  getAuctionBids,
  cancelAuction,
  getOnSaleNftByUserId,
  endAuction
} = require("../controllers/auctionController");
const { isAuthenticatedUser } = require("../middleware/authentication");

router.route("/createAuction").post(isAuthenticatedUser, create);
router.route("/sellNft").post(isAuthenticatedUser, sell);
router.route("/buyNft").post(isAuthenticatedUser, buy);
router.route("/getOnSaleNfts").get(isAuthenticatedUser,getOnSaleNftByUserId)
router.route("/getAllSales/:skip").get(getAllSale);
router.route("/getAllAuctions").get(getAllAuction);
router.route("/getAllExplore/:sort/:skip").get(getAllExplore);
router.route("/getAuctionById/:auctionId").get(getAuctionById);
router.route("/getAuctionByNftId/:NftId").get(getAuctionByNftId);
router.route("/startAuction").get(isAuthenticatedUser, startAuction);
router.route("/placeBid").post(isAuthenticatedUser, placeBid);
router.route("/auctionBids").post(getAuctionBids);
router.route("/cancelAuction").post(isAuthenticatedUser,cancelAuction)
router.route("/endAuction").post(isAuthenticatedUser,endAuction)

module.exports = router;
