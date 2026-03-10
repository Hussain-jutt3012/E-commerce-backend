import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    allProductFetch,
    productcreate,
    Productdelete,
    productUpdate,
    menproductFetch,
    womenProductFetch,
    kidsProductFetch,
} from "../controllers/Product.controller.js";
import { upload } from "../middleware/multer.middleware.js";


const router = Router()

router.route("/:sellerId/product-upload").post(verifyJWT,
    upload.fields([
        {
            name: "images",
            maxCount: 10
        },

        {
            name: 'sizeChartImage',
            maxCount: 1
        }
    ]),
    productcreate
)

router.route("/:sellerId/:productId/product-update").put(verifyJWT,
    upload.fields([
        {
            name: "images",
            maxCount: 10
        }
    ]),
    productUpdate
)

router.route("/:sellerId/:productId/product-delete").delete(verifyJWT, Productdelete)
router.route("/allproductfetch").get(allProductFetch)
router.route("/mens-product").get(menproductFetch)
router.route("/womens-product").get(womenProductFetch)
router.route("/kids-product").get(kidsProductFetch)


export default router