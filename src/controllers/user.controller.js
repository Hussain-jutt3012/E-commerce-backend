import { User } from "../model/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(404, "user is not found")
        }

        console.log("USER DETECT", user)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        console.error(error)
        throw new ApiError(400, "Something Went wrong while generating Access and RefreshToken")
    }

}


const adminRegister = asyncHandler(async (req, res) => {

    const { userId } = req.params

    const { username, name, email, password, role, storeName, bankDetails, } = req.body

    if ([username, name, email, password, role].some(
        field => !field || field.trim() === ""
    )) {
        throw new ApiError(400, "All fields are required");
    }

    const userRequest = await User.findById(userId)

    if (userRequest.role !== "admin") {
        throw new ApiError(400, "You have no Access")
    }

    const existeduser = await User.find({
        $or: [{ username }, { email }]
    })


    if (!existeduser) {
        throw new ApiError(400, "User is already Exist")
    }

    const user = await User.create({
        username: username,
        name: name,
        email: email,
        password: password,
        role: role,

        ...(role === "seller" && {
            storeName: storeName || "",
            bankDetails: bankDetails || "",
            verificationStatus: bankDetails && storeName ? "approved" : "pending"
        })

    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.json(new ApiResponse(200, createdUser, "UserCreated SucessFully"))

})

const UserLogin = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body

    if (!email) {
        throw new ApiError("Email is Required")
    }

    if (!password) {
        throw new ApiError("Password is required")
    }

    if (!username) {
        throw new ApiError(400, "UserName is required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (user.verificationStatus === "pending") {
        throw new ApiError(400, "Kindly Approved the First Request Before login")
    }

    console.log("USER DATA", user)

    if (!user) {
        throw new ApiError(400, "User is not found")
    }

    const ispassowrdvalid = await user.isPasswordCorrect(password)

    if (!ispassowrdvalid) {
        throw new ApiError(400, "Invalid Credentils")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInuser = await User.findById(user._id).select("-password -refreshToken")


    const options = {
        httpOnly: true,
        secure: false
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInuser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})


const refreshToken = asyncHandler(async (req, res) => {

    const token = req.cookies?.refreshToken || req.body?.refeshToken

    if (!token) {
        throw new ApiError(400, "Unauuthorized Request")
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id).select("-password", "-refreshToken")

    if (!user) {
        throw new ApiError(400, "Invalid Refresh Token")
    }

    if (token !== user.refreshToken) {
        throw new ApiError(400, "Refresh Token is used or Expiered")
    }

    const { accessToken, newrefeshToken } = await generateAccessAndRefreshToken(user._id)

    const option = {
        httpsOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookies("accessToken", accessToken, option)
        .cookies("refreshToken", newrefeshToken, option)
        .json(new ApiResponse(200, accessToken, newrefeshToken, "Refresh Token update SucessFully"))
})

const Userlogout = asyncHandler(async (req, res) => {

    await User.findByIdAndDelete(
        req.user._id,
        {

            $unset: {
                refreshToken: 1
            },
        },
        {
            new: true
        }

    )

    const option = {
        httpsOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearcookies("accessToken", option)
        .clearcookies("refreshToken", option)
        .json(new ApiResponse(200, "User Logout Sucessfully"))

})

const UpdateProfile = asyncHandler(async (req, res) => {

    const { userId, sellerId } = req.params

    const { verificationStatus, bankDetails, name, storeName, username } = req.body

    const userRequest = await User.findById(userId)

    if (userRequest.role !== "admin") {
        throw new ApiError(400, "you have no access to update the Profile")
    }

    const updatedFeilds = {}

    if (name && !userRequest.name) {
        updatedFeilds.name = name
    }

    if (storeName && !userRequest.storeName) {
        updatedFeilds.storeName = storeName
    }

    if (bankDetails && !userRequest.bankDetails) {
        updatedFeilds.bankDetails = bankDetails
    }

    if (username && !userRequest.username) {
        updatedFeilds.username = username
    }

    if (verificationStatus && !userRequest.verificationStatus) {
        updatedFeilds.verificationStatus = verificationStatus
    }

    const user = await User.findByIdAndUpdate(
        sellerId,
        {
            $set: updatedFeilds,

        },
        { new: true }
    )

    if (!user) {
        throw new ApiError(400, "Something went wrong while Update the Profile", user)
    }

    return res.status(200).json(new ApiResponse(200, "Profile update Sucessfully"))
})


const changeCurrentpassword = asyncHandler(async (req, res) => {

    const { newPassowrd, oldPassword } = req.body

    if (!newPassowrd) {
        throw new ApiError(400, "New Passowrd is required")
    }

    if (!oldPassword) {
        throw new ApiError(400, "Old passowrd is required")
    }

    const finduser = await User.findById(req.user._id)

    const iscorrectpassword = finduser.isPasswordCorrect(oldPassword)

    if (!iscorrectpassword) {
        throw new ApiError(400, "Enter a Correct passowrd")
    }

    finduser.password = newPassowrd

    await User.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, "passowrd update SucessFully"))

})

export {
    adminRegister,
    UserLogin,
    Userlogout,
    changeCurrentpassword,
    refreshToken,
    UpdateProfile,
}