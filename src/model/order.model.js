import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],

        totalAmount: {
            type: Number,
            required: true,
        },

        paymentMethod: {
            type: String,
            enum: ["COD", "Online"],
            default: "COD",
        },

        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending",
        },

        orderStatus: {
            type: String,
            enum: ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
            default: "Pending",
        },

        shippingAddress: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            addressLine: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String },
            country: { type: String, default: "Pakistan" },
        },

        deliveredAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);