import { Router } from "express"
import { registerUser, UserLogin } from "../controllers/customer.controller.js"
import { SingUpVerifyOTP,  LoginOTPVerify } from "../controllers/customer.controller.js"

const router = Router()

router.route("/auth/otp/send").post(registerUser)
router.route("/SingUpVerifyOTP").post(SingUpVerifyOTP)
router.route("/Login-otp-Session").post(UserLogin)
router.route("/Verify-login-session").post(LoginOTPVerify)

export default router