import { Product } from "../model/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UploadOnCloudinary } from "../utils/Cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/user.model.js";
import mongoose from "mongoose";


const productcreate = asyncHandler(async (req, res) => {

    const { sellerId } = req.params
    const {
        title,
        description,
        category,
        subCategory,
        basePrice,
        status
    } = req.body

    const userRequest = await User.findById(sellerId)

    if (!userRequest) {
        throw new ApiError(400, "User is not found")
    }

    if (userRequest.verificationStatus === "pending") {
        throw new ApiError(400, "Verify Your Status")
    }


    if ([title, description, category, subCategory, status, basePrice].some(field => !field || field.trim === "")) {
        throw new ApiError(400, "All Feilds are Required")
    }

    const variants = JSON.parse(req.body.variants);

    for (const v of variants) {

        if (v.stock == null || isNaN(v.stock) || v.stock < 0) {
            throw new Error("Stock must be a valid number and cannot be negative");
        }

        if (!v.size || typeof v.size !== "string") {
            throw new ApiError(400, "Sized Are Required")
        }

        if (!v.color || typeof v.color !== "string") {
            throw new ApiError(400, "Color Must be Required")
        }

        if (!v.sku || typeof v.sku !== "string") {
            throw new ApiError("SKU Must be Required")
        }

    }

    const imagesLocalpath = req.files?.images

    const sizechartimagesLocalpath = req.files?.sizeChartImage?.[0]?.path

    const productImageUpload = await UploadOnCloudinary(imagesLocalpath)

    const sizeimageupload = await UploadOnCloudinary(sizechartimagesLocalpath)


    if (!productImageUpload.length) {
        console.error("Cloudinary upload error:", productImageUpload);
        throw new ApiError(400, "Product images failed to upload");
    }


    if (!sizeimageupload.length || !sizeimageupload[0]?.secure_url) {
        console.error("Cloudinary size chart upload error:", sizeimageupload);
        throw new ApiError(400, "Size chart image failed to upload");
    }

    const Products = await Product.create({
        title: title,
        category: category,
        subCategory: subCategory,
        basePrice: basePrice,
        description: description,
        variants,
        images: productImageUpload.map(img => img?.url),
        sizeChartImage: sizeimageupload?.secure_url || "",
        sellerId: userRequest._id
    })

    if (!Products) {
        throw new ApiError(400, "Something went wrong while creating the Product")
    }

    return res.status(200).json(new ApiResponse(Products, "Product Create Sucessfully"))
})

const productUpdate = asyncHandler(async (req, res) => {

    const { sellerId, productId } = req.params

    const {
        title,
        description,
        basePrice,
        status
    } = req.body

    const productid = await Product.findById(productId)

    if (!productid) {
        throw new ApiError(400, "ProductId required for update the Product")
    }

    const userRequest = await User.findById(sellerId)


    if (userRequest?.role !== "seller") {
        throw new ApiError(400, "You have no Access")
    }


    if (!title) {
        throw new ApiError(400, "title are required for update the product")
    }

    if (!description) {
        throw new ApiError(400, "Descritpion are required for update the product")
    }

    if (!basePrice) {
        throw new ApiError(400, "BasePrice are required for update the product")
    }

    if (!status) {
        throw new ApiError(400, "status are required for update the product")
    }

    const variants = JSON.parse(req.body.variants);

    for (const v of variants) {

        if (v.stock == null || isNaN(v.stock) || v.stock < 0) {
            throw new Error("Stock must be a valid number and cannot be negative");
        }

        if (!v.size || typeof v.size !== "string") {
            throw new ApiError(400, "Sized Are Required")
        }

        if (!v.color || typeof v.color !== "string") {
            throw new ApiError(400, "Color Must be Required")
        }

        if (!v.sku || typeof v.sku !== "string") {
            throw new ApiError("SKU Must be Required")
        }

    }

    const product = await Product.findOne({
        _id: new mongoose.Types.ObjectId(req.params.productId),
        sellerId: new mongoose.Types.ObjectId(req.user._id)
    })


    if (!product) {
        throw new ApiError(403, "You can update only your own product")
    }


    const imageslocalpath = await req.files?.images

    if (!imageslocalpath) {
        throw new ApiError(400, "Images are required")
    }

    const imageUplaodOnCloudinary = await UploadOnCloudinary(imageslocalpath)


    if (!imageUplaodOnCloudinary.length) {
        throw new ApiError(400, "Image Failed to Upload on Cloudinary")
    }

    const Productupdtae = await Product.findByIdAndUpdate(
        productId,
        {
            $set: {

                title,
                description,
                basePrice,
                status,
                variants,
            },

            $push: {
                images: { $each: imageUplaodOnCloudinary }
            }
        },

        {
            new: true
        }
    )


    if (!Productupdtae) {
        throw new ApiError(400, "Product is not update")
    }

    return res.status(200).json(200, new ApiResponse("Product Update Sucessfully",Productupdtae))

})

const Productdelete = asyncHandler(async (req, res) => {

    const { sellerId, productId } = req.params

    const userRequest = await User.findById(sellerId)

    if(userRequest.role !== "seller"){
        throw new ApiError(400, "You have no access for delete the Product")
    }

    const isProdudctIdExist = await Product.findById(productId)

    if(!isProdudctIdExist){
        throw new ApiError(400, "Product Id is not found")
    }

    const ProductownerExist = await Product.findOne({
        _id: new mongoose.Types.ObjectId(productId),
        sellerId: new mongoose.Types.ObjectId(req.user._id)
    })

    if(!ProductownerExist){
        throw new ApiError(400, "You only update your own product")
    }

    const productdeleted = await Product.findOneAndDelete(productId)

    if(!productdeleted){
        throw new ApiError(400, "Product is not deleted")
    }

    return res.status(200).json( new ApiResponse(200, "Product delete Sucessfully", productdeleted))

})

const allProductFetch = asyncHandler(async(req, res) =>{

    const productfetch = await  Product.aggregate([

        {
            $limit: 50
        },

        {
            $project:{
                _id:0,
                title: 1,
                description: 1,
                category: 1,
                subCategory: 1,
                images: 1,
                basePrice: 1,
                currency: 1
            }
        }
    ])

    return res.status(200).json( new ApiResponse(200, "All Product fetch is SucessFully", productfetch))

})

export {
    productcreate,
    productUpdate,
    Productdelete,
    allProductFetch
}