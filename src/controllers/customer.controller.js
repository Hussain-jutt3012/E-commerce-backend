import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Customer } from "../model/Customer.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import twilio from "twilio";
import { GenerateAndStoredOTP, OTPVerify } from "../utils/OTPService.js";


const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await Customer.findById(userId)

        if (!user) {
            throw new ApiError(400, "User is not found")
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "ERROR in While User generating and RefreshToken")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    try {
        const { phone } = req.body

        if (!phone) {
            throw new ApiError(400, "Phone is Required")
        }
        const userExist = await Customer.findOne({ phone });

        if (userExist) {
            throw new ApiError(400, "This phone number is already registered");
        }

        const { OTP, sessionId } = await GenerateAndStoredOTP(phone)

        const accountsid = process.env.ACCOUNT_SID
        const authToken = process.env.AUTH_TOKEN
        const client = new twilio(accountsid, authToken)

        await client.messages.create({
            body: `Your OTP Code is ${OTP}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        })

        const option = {
            httpOnly: true,
            secure: true,
            maxAge: 5 * 60 * 10000
        }

        return res
            .status(200)
            .cookie("sessionId", sessionId, option)
            .json(200, new ApiResponse("OTP Generate SucessFully",))
    } catch (error) {
        console.log("ERROR IN USER OTP Generation", error)
    }
})

const SingUpVerifyOTP = asyncHandler(async (req, res) => {

    const { otp } = req.body;

    if (!otp) throw new ApiError(400, "OTP is Missing");

    const sessionId = req.cookies.sessionId;
    if (!sessionId) throw new ApiError(400, "Session Id is Missing");

    const phone = await OTPVerify(otp, sessionId)

    const userCreated = await Customer.create({
        phone,
        isVerified: true
    });

    res.clearCookie("sessionId");

    const tokens = await generateAccessAndRefreshToken(userCreated._id);
    return res.status(200).json(new ApiResponse("User Verified Successfully", tokens));
});

const UserLogin = asyncHandler(async (req, res) => {

    try {

        const { phone } = req.body

        if (!phone) {
            throw new ApiError(400, "Phone is Required")
        }

        const userExist = await Customer.findOne({ phone });

        if (!userExist) {
            throw new ApiError(400, "This phone number is Not Registerd");
        }

        if (userExist.isVerified === false) {
            throw new ApiError(400, "Verify your Status go to the Signup")
        }

        const accountsid = process.env.ACCOUNT_SID
        const authToken = process.env.AUTH_TOKEN
        const client = new twilio(accountsid, authToken)

        const { OTP, sessionId } = await GenerateAndStoredOTP(phone)

        await client.messages.create({
            body: `Your OTP Code is ${OTP}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        })

        const option = {
            httpOnly: true,
            secure: true,
            maxAge: 5 * 60 * 10000
        }

        return res
            .status(200)
            .cookie("sessionId", sessionId, option)
            .json(200, new ApiResponse("OTP Generate SucessFully",))
    } catch (error) {
        console.log("ERROR IN USER OTP Generation", error)
    }

})


const LoginOTPVerify = asyncHandler(async (req, res) => {

    try {
        const { otp } = req.body;

        if (!otp) throw new ApiError(400, "OTP is Missing");

        const sessionId = req.cookies.sessionId;
        if (!sessionId) throw new ApiError(400, "Session Id is Missing");

        const phone = await OTPVerify(otp, sessionId)

        const user = await Customer.findOne({ phone })

        if (!user || user.isVerified === false) {
            throw new ApiError(400, "Unauthorized")
        }

        const token = await generateAccessAndRefreshToken(user._id)

        res.clearCookie("sessionId");

        return res.status(200).json(new ApiResponse("Login Successfully", token));
    } catch (error) {
        console.log("ERROR IN USER LOGIN VERIFY OTP Generation", error)
    }

});

export {
    registerUser,
    SingUpVerifyOTP,
    UserLogin,
    LoginOTPVerify
}