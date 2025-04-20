const mongoose = require("mongoose");

async function connectDB(){
    try{
       await mongoose.connect(process.env.MONGODB_URL) 
       
       //This gets the default connection object from Mongoose.
       const connection = mongoose.connection;
       
       connection.on('connected',()=>{
        console.log("MongoDB connected")
       })

       connection.on('error',(error)=>{
        console.log("Something is wrong in mongoDB")
       })

    } catch(error){
      console.log("Error happens ", error)
    } 

}

module.exports = connectDB;