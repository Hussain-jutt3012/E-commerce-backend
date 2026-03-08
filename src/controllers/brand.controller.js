import { Brand } from "../model/brand.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../model/user.model.js"


const brandCreate = asyncHandler(async (req, res) => {

    const { userId } = req.params

    const { name, commissionPercentage } = req.body

    if (!(name && commissionPercentage)) {
        throw new ApiError(400, "All Fields are required")
    }

    const userRequest = await User.findById(userId)

    if (!userRequest) {
        throw new ApiError(404, "User not found")
    }

    if (userRequest.role !== "seller") {
        throw new ApiError(400, "You have no Access")
    }

    if (userRequest.verificationStatus === "pending") {
        throw new ApiError(400, "verificationStatus must be approved from admin")
    }

    const brandcreation = await Brand.create({
        ownerId: userRequest._id,
        name: name,
        commissionPercentage: commissionPercentage,
    })

    if (!brandcreation) {
        throw new ApiError(400, "Something went wrong while create the brand")
    }

    return res.status(200).json(new ApiResponse(200, "Brand create sucessfully"))
})

export {
    brandCreate
}