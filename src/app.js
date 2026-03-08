import express, {urlencoded} from "express"
import cookieparser from "cookie-parser"
import cors from "cors"


const app = express()

app.use(cors({
    withCredentials:true,
    methods: ["GET", "POST", "DELETE", "PATCH"],
    origin: "*"
}))

app.use(express.json({limit:"16kb"}))
app.use(express.json(urlencoded({extended:true, limit:"16kb"})))
app.use(express.static("public"))
app.use(cookieparser())


// importing routes

import customerRoutes from "./routes/Customer.routes.js" 
import userRoutes from "./routes/user.routes.js"
import brandRoutes from "./routes/brandcreate.routes.js"
import productRoutes from "./routes/product.routes.js"


app.use("/api/v1/customer", customerRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/brand", brandRoutes)
app.use('/api/v1/products', productRoutes)
 
export { app }