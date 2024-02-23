const express = require("express")
const router = express.Router()

const {createCategory, getAllCategories,deleteCategory} = require("../controllers/categoryController")

const {isAuthenticatedUser} = require("../middleware/authentication")

router.route("/createCategory").post(isAuthenticatedUser,createCategory)
router.route("/getAllCategories").get(getAllCategories)
router.route("/deleteCategory").delete(isAuthenticatedUser,deleteCategory)

module.exports = router;
