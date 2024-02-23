const express = require("express");
const router = express.Router();
const os = require('os')
const multer = require("multer");
const {
  register,
  login,
  deleteUser,
  logout,
  updateUserDetails,
  getAllActivities
} = require("../controllers/userController");
const { isAuthenticatedUser } = require("../middleware/authentication");
const upload = multer({ dest:  os.tmpdir()})

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/updateUserDetails").post(isAuthenticatedUser,upload.fields([{name:"userImage",maxCount:1},{name:"bannerImage",maxCount:1}]),updateUserDetails);
router.route("/logout").get(logout);
router.route("/getAllActivities").get(isAuthenticatedUser,getAllActivities);
router.route("/delete/:id").post(deleteUser);

module.exports = router;
