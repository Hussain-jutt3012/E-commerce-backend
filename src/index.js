import connectDB from "./db/index.js";
import { app } from "./app.js"
import dotenv from "dotenv"
import { connectRedis } from "./utils/Redis.js";



dotenv.config({ 
    path: './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 7000, () =>{
        console.log(`server is runing at ${process.env.port}`)
    })
}).catch((error) =>{
    console.log("Mongooodb Coneection Failed ", error)
})

connectRedis()