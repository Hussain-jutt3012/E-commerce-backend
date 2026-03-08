import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    commissionPercentage: {
      type: Number,
      default: 15
    },

    isActive: {
      type: Boolean,
      default: true
    }

  },
  { timestamps: true }
);

export const Brand = mongoose.model("Brand", brandSchema);