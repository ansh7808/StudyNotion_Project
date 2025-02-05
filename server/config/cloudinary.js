const cloudinary = require("cloudinary").v2; 

exports.cloudinaryConnect = () => {
	try {
		cloudinary.config({
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.API_KEY,
			api_secret: process.env.API_SECRET,
		});
	} catch (error) {
		console.log(error);
	}
};

exports.uploadImageToCloudinary = async (file, folder, width, height) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        file.tempFilePath,
        {
          folder: folder,
          width: width,
          height: height,
          crop: "fill",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
    });
  };
  
//   module.exports = { uploadImageToCloudinary };