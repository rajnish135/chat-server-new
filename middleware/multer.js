const multer = require("multer")

const Storage = multer.diskStorage(
    {
        destination:function (req,file,cb){
           return cb(null,"./uploads")
        },
        filename:function (req,file,cb){
        return cb(null, `${ new Date().toLocaleDateString().split("/").join("-") }-${file.originalname}`);

        }
    }
);

const upload = multer({storage:Storage});

module.exports = upload;

