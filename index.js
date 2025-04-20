const express = require("express");

const connectDB = require('./config/connectDB')
const router = require('./routes/index')
const cookieParser = require("cookie-parser")
const {app,server} = require("./socket/index")

// const app = express();

//CORS-(CROSS ORIGIN RESOURCE SHARING)
const cors = require("cors")
require('dotenv').config();

app.use(cors({
   origin: "*",
   credentials: true
}));

// app.use(cors({
//    origin: '*', // Allow all origins
//    credentials: true // Note: 'credentials' doesn't work with origin '*'
//  }));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const PORT = 8000;

app.use('/api',router);

connectDB().then(()=>{
   server.listen(PORT, ()=>{console.log("Server Started")    
   })
})   










/* 
### **Breakdown**
1.   require('dotenv').config();
   - Loads environment variables from a `.env` file into `process.env`.  
   - Ensures that `process.env.FRONTEND_URL` is available in the code.

2.   app.use(cors({...}))
   - Applies CORS middleware to the `app`, allowing the frontend to access backend resources.

3.  CORS Options:
   {
       origin: process.env.FRONTEND_URL,  // Only allows requests from this frontend URL
       
       credentials: true                  // Allows cookies and authentication headers in requests from the frontend to the backend.
   }

### Summary:
✔ **Allowed:** Requests from `process.env.FRONTEND_URL`.  
❌ **Blocked:** Requests from any other domain.

=> credentials: true; 
It allows cookies and authentication headers in requests from the frontend to the backend.
Without this, cookies and tokens won't be sent, making authentication fail.

*/