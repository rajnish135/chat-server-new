const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/UserModel");
const { uploadOnCloudinary } = require("../cloudinary/cloudinary");

const fs = require("fs")

async function updateUserDetails(req, res) {
  try {

    // Try getting token from Authorization header
    const authHeader = req.headers.authorization || "";
    let token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : "";

    // If not found in header, try from cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }
    console.log("token ", token);
    
    const user = await getUserDetailsFromToken(token);

    console.log("user ", user)

    const { name } = req.body;

    const updateData = { name };

    if(req.file) {
      // Upload to Cloudinary using your existing local file path
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
      
      if (!cloudinaryResponse) {
        throw new Error("Failed to upload image to Cloudinary");
      }

      updateData.profile_pic = cloudinaryResponse.secure_url;
      
      // Optional: Delete the local file after successful upload
      fs.unlink(req.file.path, (err) => {
        if(err) 
        console.log("Error deleting local file:", err);
      });
    }

    await UserModel.updateOne({ _id: user._id }, updateData);

    const updatedUser = await UserModel.findById(user._id);

    return res.json({
      message: 'User updated successfully',
      data: updatedUser,
      success: true
    });
  } 
  catch (error) {
    console.log("error in updateuserdetails", error)
    // Clean up file if error occurred
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Error cleaning up file after error:", err);
      });
    }
    
    return res.status(500).json({
      message: error.message || error,
      error: true
    });
  }
}

module.exports = updateUserDetails;