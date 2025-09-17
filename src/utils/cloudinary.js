import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"; //filesystem in node builtin


// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDE_NAME, //cloudName defined in env
  api_key: process.env.CLOUDE_API_KEY,
  api_secret: process.env.CLOUDE_API_SECRET, // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localFilePath) => {
  try {



    //first check localfilepath exist
    if (!localFilePath) return "localFile Path Doesn't Exist";
    //Upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });


    //File has been uploaded
    console.log('file is upload on cloudinary', response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);//remove locally saved temporery file as the upload operation faild
  }

}

export { uploadOnCloudinary }