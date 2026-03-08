import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const UploadOnCloudinary = async (files) => {
    if (!files) return [];

    try {

        const uploaded = await Promise.all(
            files.map(file =>
                cloudinary.uploader.upload(file.path, { resource_type: "auto" })
            )
        );
    
        files.forEach(file => {
            if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });

        console.log("File Upload Sucessfully on cloudinary", uploaded)

        return uploaded
    } catch (error) {

        files.forEach(file => {
            if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });

        return null
    }
};

export { UploadOnCloudinary }