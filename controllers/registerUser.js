const { uploadOnCloudinary } = require("../cloudinary/cloudinary");
const UserModel = require("../models/UserModel");
const bcryptjs = require("bcryptjs");

async function registerUser(req, res) {
  try {
   
    const { name, email, password } = req.body;

    let profileImageUrl = "";

    if (req.file && req.file.path) {
      const uploadedImage = await uploadOnCloudinary(req.file.path);

      if (uploadedImage && uploadedImage.secure_url) {
        profileImageUrl = uploadedImage.secure_url;
      }
    }

    const checkEmail = await UserModel.findOne({ email }).select();
    if (checkEmail) {
      return res.status(400).json({
        message: "User already exists",
        error: true,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const payload = {
      name,
      email,
      password: hashedPassword,
      profile_pic: profileImageUrl,
    };

    const user = await UserModel.create(payload);
    console.log("user", user);

    return res.status(201).json({
      message: "User created successfully",
      success: true,
    });
  } 
  catch (error) {
    return res.status(500).json({
      message: "Error Occurs at register user in backend",
      error: true,
    });
  }
}


module.exports = registerUser;
