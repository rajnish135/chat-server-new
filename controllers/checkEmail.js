const UserModel = require("../models/UserModel")

async function checkEmail(req,res) {
    console.log("Login REQ sspsdssp;")

    try{
    
    const {email} = req.body;

    const user = await UserModel.findOne({email}).select("-password");
    
    if(!user){
        return res.status(400).json({
            message:"User does not exist",
            error:true,
        })
    }

    return res.status(200).json({
        message:"email Verified",
        success:true,
        data:user,
    })

    }
    catch(err){
        return res.status(500).json({
            message:err.message,
            error:true,
        })
    }
}

module.exports = checkEmail;