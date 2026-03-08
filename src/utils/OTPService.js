import { redisClient } from "../utils/Redis.js";
import { ApiError } from "../utils/ApiError.js";
import crypto from "crypto"


const GenerateAndStoredOTP = async (phone) => {

    const OTP = Math.floor(100000 + Math.random() * 900000).toString();

    const sessionId = crypto.randomBytes(16).toString("hex")

    const key = `sessionId:${sessionId}`

    await redisClient.hSet(key, { sessionId, phone, OTP })

    return { OTP, sessionId }

}

const OTPVerify = async (otp, sessionId) => {

    const key = `sessionId:${sessionId}`;

    const storedOTP = await redisClient.hGetAll(key);

    if (!storedOTP || Object.keys(storedOTP).length === 0) {
        throw new ApiError(400, "OTP is expired");
    }

    if (storedOTP.OTP !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    await redisClient.expire(key, 300)

    await redisClient.del(key); 

    return storedOTP.phone;

}

export {
    GenerateAndStoredOTP,
    OTPVerify
}