const jwt = require('jsonwebtoken')
const UserModel = require('../models/UserModel')


const getUserDetailsFromToken = async(token)=>{
    
    if(!token){
        return {
            message : "session out",
            logout : true,
        }
    }
    
    //jwt.verify() method returns tokendata/payload after successful verification of user
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)

    const user = await UserModel.findById(decode.id).select('-password')

    return user;
}

module.exports = getUserDetailsFromToken