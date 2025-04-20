const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    text : {
        type : String,
        default : ""
    },
    imageUrl : {
        type : String,
        default : ""
    },
    videoUrl : {
        type : String,
        default : ""
    },
    seen : {
        type : Boolean,
        default : false
    },
    senderId : {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    seenBy: [{
        userId: { type: mongoose.Schema.ObjectId, ref: 'User' },
        seenAt: { type: Date, default: Date.now }
    }],
  
},
{
    timestamps : true
})

const MessageModel = mongoose.model('Message',messageSchema)

module.exports = {
    MessageModel
}
