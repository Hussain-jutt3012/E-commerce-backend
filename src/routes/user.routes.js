import { Router } from "express";
import {
    adminRegister,
    UserLogin,
    Userlogout,
    changeCurrentpassword,
    refreshToken,
    UpdateProfile
} from "../controllers/user.controller.js"


const router = Router()

router.route("/:userId/user-register").post(adminRegister)
router.route("/user-login").post(UserLogin)
router.route("/user-logout").post(Userlogout)
router.route("/change-password").post(changeCurrentpassword)
router.route("/refresh-token").post(refreshToken)
router.route("/:userId/:sellerId/profile-update").patch(UpdateProfile)


export default router