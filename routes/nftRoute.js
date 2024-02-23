const express = require("express");
const router = express.Router();
const os = require('os')
const multer = require("multer");
const {
  create,
  getNftByNftId,
  getAllNfts,
  getNftByCollection,
  getUserCreatedNft,
  getNftByOwnerId,
  getNftOwnersHistory,
  getUserOffers,
} = require("../controllers/nftController");
const { isAuthenticatedUser } = require("../middleware/authentication");
const upload = multer({ dest:  os.tmpdir()})

router.route("/create").post(isAuthenticatedUser,upload.single("nftImage"), create);
router.route("/userCreatedNft").get(isAuthenticatedUser,getUserCreatedNft)
router.route("/getNftById/:id").get(getNftByNftId);
router.route("/getNftByUserId").get(isAuthenticatedUser,getNftByOwnerId);
router.route("/getAll").get(getAllNfts);
router.route("/getNftByCollection/:id").get(getNftByCollection);
router.route("/nftOwnerHistory").post(getNftOwnersHistory);
router.route("/nftOffers").get(isAuthenticatedUser,getUserOffers);


module.exports = router;
