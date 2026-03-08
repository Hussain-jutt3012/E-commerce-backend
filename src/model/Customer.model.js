import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const customerSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        select: true
    },
    otpExpiresAt: {
        type: Date,
        select: false
    },
    sessionId: {
        type: String,
        select: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    // for login after verification
    refreshToken: {
        type: String,
        select: false
    }
}, { timestamps: true },
);

customerSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            phone: this.phone
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
};

customerSchema.methods.generateRefreshToken = function () {

    return jwt.sign(
        {
            _id: this._id
        },

        process.env.REFRESH_TOKEN_SECRET,

        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )

}


export const Customer = mongoose.model("Customer", customerSchema);