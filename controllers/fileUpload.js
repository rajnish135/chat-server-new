const { uploadOnCloudinary } = require("../cloudinary/cloudinary");
const fs = require("fs")

async function fileUpload(req,res){

    let Url = "";

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];

    try{
        if(req.file) {
            // Upload to Cloudinary using your existing local file path
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
            console.log("Res from cloudinary",cloudinaryResponse);

            Url = cloudinaryResponse.secure_url;
 
            if (fs.existsSync(req.file.path)) {
                fs.unlink(req.file.path, (err) => {
                  if (err) console.log("Error deleting local file:", err);
                });
              }

            const extension = Url.split('.').pop().split('?')[0].toLowerCase();

            if (imageExtensions.includes(extension)){
                const imageUrl = Url;   

            return res.json({
                message: 'User updated successfully',
                data: imageUrl,
                success: true,
                extension
            });
            }
            else
            {
                const videoUrl = Url;

                return res.json({
                    message: 'User updated successfully',
                    data: videoUrl,
                    success: true,
                    extension
                });
            }
        }
    }
    catch(err){
        console.log("Error occurs:",err);
    }
}

module.exports = fileUpload