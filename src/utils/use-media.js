const { v2: cloudinary } = require('cloudinary');

const configCloudinary = () =>{
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

const addImage = async (filePath , folder) =>{
  configCloudinary();
  const result = await cloudinary.uploader.upload(filePath, {
    folder
  });
  return result;
}

const deleteImage = async publicId =>{
  configCloudinary();
  const result = cloudinary.uploader.destroy(publicId);
  return result;
}

const addVideo = async (filePath, folder)=>{
  configCloudinary();
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "video",
    eager_async: true,
    chunk_size: 20000000,
  });
  return result;
}

const deleteVideo = async publicId =>{
  configCloudinary();
  const result = await cloudinary.api.delete_resources(publicId, { resource_type: "video" });
  return result
}

module.exports = {
  addImage,
  deleteImage,
  addVideo,
  deleteVideo
}