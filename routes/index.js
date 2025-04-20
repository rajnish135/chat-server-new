const {Router} = require('express')
const registerUser = require('../controllers/registerUser')
const checkEmail = require('../controllers/checkEmail')
const checkPassword = require('../controllers/checkPassword')
const userDetails = require('../controllers/userDetails')
const logout = require('../controllers/logout')
const updateUserDetails = require('../controllers/updateUserDetails')
const searchUser = require('../controllers/searchUser')
const fileUpload = require('../controllers/fileUpload')

//disk storage of files bcz destination is given inside multer
const upload = require("../middleware/multer");

//ram storage of files bcz destination is not given inside multer
const multer = require("multer"); 
const upld = multer();


const router = Router();

//create user api
router.post('/register',upload.single("profile_pic"),registerUser)

//check user email
router.post('/email',upld.none(),checkEmail)

//check user password
router.post('/password',checkPassword)

//login user details
router.get('/user-details',userDetails)

// //logout user
router.get('/logout',logout)

//update user details
router.post('/update-user', upload.single('profile_pic'), updateUserDetails);

//search user
router.post("/search-user",searchUser)

//upload photo/videos
router.post("/file-upload",upload.single("imageUrl"),fileUpload)


module.exports = router