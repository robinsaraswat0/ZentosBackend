const express = require("express");
const router = express.Router();
const os = require('os')
const multer = require("multer");

const upload = multer({ dest:  os.tmpdir()})

const {uploadToPinata} = require('../controllers/uploadPinata')

router.route("/upload-pinata").post(upload.single("image"),uploadToPinata);

module.exports = router;