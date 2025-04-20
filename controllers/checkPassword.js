const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

async function checkPassword(req,res){

        try{
        const {password,user_id} = req.body;

        const user = await UserModel.findById(user_id);

     // you can compare a hashed password with a non-hashed password using bcryptjs.compare()
        const verifyPassword = await bcryptjs.compare(password, user.password);
  
        if(!verifyPassword)
        {
            return res.status(400).json({
                message:"Please check your entered password",
                error:true
            })
        }

        const tokenData = {
            id:user._id,
            email:user.email
        }

        const token = await jwt.sign(tokenData,process.env.JWT_SECRET_KEY)

        const cookieOptions = {
            httpOnly:true,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        
        }

        return res.cookie('token',token,cookieOptions).status(200).json({
            message:"Login Successfully",
            token:token,
            success:true,
        })

    }
    catch(err){
        return res.status(500).json({
            message: err.message || error,
            error:true
        })
    }
    
}

module.exports = checkPassword