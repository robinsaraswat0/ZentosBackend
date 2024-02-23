const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const ErrorHandler = require("../utils/errorHandler")
const Categories = require("../models/Category")
const Mongoose = require("mongoose")
const { ObjectId } = Mongoose.Types


exports.createCategory = catchAsyncErrors(async(req,res,next)=>{
    const {name} = req.body
    const isCategory = await Categories.find({name:{$regex:name,$options:"i"}})
    // console.log(isCategory.length)
    if(isCategory.length){
        return next(new ErrorHandler("Category already Exist",409))
    }
    const category = await Categories.create({
        name:req.body.name,
        createdBy:ObjectId(req.user.userId)
    })
    res.status(201).json({
        success:true,
        category
    })
})

exports.getAllCategories = catchAsyncErrors(async(req,res,next)=>{
    const categories = await Categories.find()
    if(!categories){
        return next(new ErrorHandler("No Categories Found",404))
    }
    res.status(201).json({
        success:true,
        categories
    })
})

exports.deleteCategory = catchAsyncErrors(async(req,res,next) => {
    const isCategory = await Categories.find({name:{$regex:req.body.name,$options:"i"}})
    if(!isCategory.length){
        return next(new ErrorHandler("No Category Found",404))
    }
    const category = await Categories.remove({name:{$regex:req.body.name,$options:"i"}})
    res.status(201).json({
        success:true,
        message:"Category deleted Successfully",
        category
    })
})