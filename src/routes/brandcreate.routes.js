import { brandCreate } from "../controllers/brand.controller.js";
import Router from "express"

const router = Router()

router.route("/:userId/brand-create").post(brandCreate)

export default router 