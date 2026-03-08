import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      enum: [
        "Women",
        "Men",
        "Kids",
        "Bridal",
        "Accessories"
      ],
      required: true
    },

    subCategory: {
      type: String
    },

    basePrice: {
      type: Number,
      required: true
    },

    discountPrice: {
      type: Number
    },

    currency: {
      type: String,
      enum: ["PKR", "USD"],
      default: "PKR"
    },

    images: [
      {
        type: String,
        required: true
      }
    ],

    sizeChartImage: {
      type: String
    },

    isMadeToOrder: {
      type: Boolean,
      default: false
    },


    variants: [
      {
        size: {
          type: String,
          required: true
        },

        color: {
          type: String
        },

        sku: {
          type: String,
          required: true,
          unique: true
        },

        stock: {
          type: Number,
          default: 0
        }
      }
    ],

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "OUT_OF_STOCK"],
      default: "ACTIVE"
    },

    rating: {
      type: Number,
      default: 0
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);