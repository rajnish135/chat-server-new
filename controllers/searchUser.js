const UserModel = require("../models/UserModel")

async function searchUser(req,res){

    try{
    const {search} = req.body;
    
    const query = new RegExp(search,"ig")

    const user = await UserModel.find({
        "$or":[
            {name: query},
            {email: query}
        ]
    }).select("-password");

    return res.json({
        message:"all user",
        data: user,
        success:true
    })
   }
   catch(err){
      return res.status(500).json({
        message:err.message || err,
        error:true
      })
   }
} 

module.exports = searchUser;    