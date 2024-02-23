const express = require("express");
const os = require('os')
const multer = require("multer");
const router = express.Router();
const {create, getAllCollections, userCollections,getCollectionDetails} = require("../controllers/collectionController");
const { isAuthenticatedUser } = require("../middleware/authentication");
const upload = multer({ dest: os.tmpdir() })

const multipleUpload = upload.fields([{name:"bannerImage",maxCount:1},{name:"collectionLogo",maxCount:1}])

router.route("/createCollection").post(isAuthenticatedUser,multipleUpload,create)
router.route("/collections").get(getAllCollections)
router.route("/userCollections").get(isAuthenticatedUser,userCollections)
router.route("/collection/:id").get(getCollectionDetails)

module.exports = router