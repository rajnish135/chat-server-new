const express = require("express")
const {Server} = require("socket.io")
const http = require('http')
require('dotenv').config();
const cors = require("cors")
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require("../models/UserModel");
const {ConversationModel} = require("../models/ConversationModel.js")
const {MessageModel} = require("../models/MessageModel.js")
const getConversation = require("../helpers/getConversation.js") 

const app = express();

app.use(cors({
    origin: "https://chatapp-client-xi.vercel.app",
    credentials: true 
}));


//socket connection
const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin: process.env.FRONTEND_URL,
        credentials:true
    }
})

const onlineUser = new Set();

io.on('connection',async(socket)=>{
    console.log("Connected user: ",socket.id)

    const token = socket.handshake.auth.token;

    const user = await getUserDetailsFromToken(token);

    if (user?._id){

        // Create room
        socket.join(user._id.toString());

        // Add to online set
        onlineUser.add(user._id.toString());

        
        // Notify all other users that this user is now online
        io.emit('user-status-change', {
            userId: user._id.toString(),
            online: true
        });

        // Broadcast current online users
        io.emit('onlineUser', Array.from(onlineUser));
    }


    socket.on('message-page', async (userId) => {

        // Step 1: Validate the userId parameter - checks for empty/undefined values
        if (!userId || userId === '') {
            return socket.emit('error', { message: "Invalid user ID provided" });
        }
         
            console.log("userId:", userId);
        
            // Step 2: Fetch user details from database using the provided userId
            const userDetails = await UserModel.findById(userId);
            
            // Step 3: If user doesn't exist, send error response
            if (!userDetails) {
                return socket.emit('error', { message: "User not found" });
            }
        
            // Step 4: Prepare user payload with essential details
            // Includes online status check from the onlineUser Set
            const payload = {
                _id: userDetails._id,
                name: userDetails.name,
                email: userDetails.email,
                online: onlineUser.has(userId),  // Checks if user is currently online
                profile_pic: userDetails.profile_pic,
            };
        
            // Step 5: Emit user details back to the client
            // This updates the UI with the user's profile information
            socket.emit('message-user', payload);
        
            // Step 6: Find conversation between current user (user._id) and target user (userId)
            // Looks for conversation in either direction and populates all messages
            // Sorts by most recent update (newest first)
            const getConversationMessage = await ConversationModel.findOne({
                "$or": [
                    { sender: user._id, receiver: userId },  // Current user is sender
                    { sender: userId, receiver: user._id }   // Current user is receiver
                ]
            }).populate('messages').sort({ updatedAt: -1 });
        
            // Step 7: Emit the conversation messages to the client
            // Falls back to empty array if no conversation exists
            socket.emit('message', {
                targetUserId: userId,  // The other user in conversation
                messages: getConversationMessage?.messages || []
              });
        
    });

    socket.on('new-message', async(data) => 
        {
                // Step 1: Validate that both sender and receiver IDs exist and are not empty strings
                if (!data?.sender || !data?.receiver || data.sender === '' || data.receiver === '') {
                    return socket.emit('error', { message: "Invalid sender or receiver ID" });
                }
                
                console.log("data", data);
    
                // Step 2: Find existing conversation between these two users
                // Looks for conversation in either direction (A->B or B->A)
                let conversation = await ConversationModel.findOne({
                    "$or": [
                        {sender: data.sender, receiver: data.receiver},
                        {sender: data.receiver, receiver: data.sender}
                    ]
                });
    
                // Step 3: If no conversation exists, create a new one with empty messages array
                if (!conversation) 
                {
                    conversation = await ConversationModel.create({
                        sender: data.sender,
                        receiver: data.receiver,
                        messages: [],
                    });
                }
                
                // Step 4: Create a new message document with the message content
                // Includes optional text, image or video URLs, and marks it as unseen initially
                const message = await MessageModel.create({
                    text: data?.text || "",
                    imageUrl: data?.imageUrl || "",  
                    videoUrl: data?.videoUrl || "",  
                    senderId: data.sender,
                    seen:false,
                });
    
                // Step 5: Add the new message's ID to the conversation's messages array
                await ConversationModel.updateOne(
                    {_id: conversation._id},
                    {"$push": {messages: message._id}}
                );
    
                // Step 6: Retrieve the updated conversation with all messages populated
                // and sorted by most recent update (newest first)
                const getConversationMessage = await ConversationModel.findOne({
                    "$or": [
                        {sender: data.sender, receiver: data.receiver},
                        {sender: data.receiver, receiver: data.sender}
                    ]
                }).populate('messages').sort({updatedAt: -1});     
                
                // Step 7: Emit the updated message list to both sender and receiver
                // This updates their chat windows in real time with the new message
                io.to(data.sender).emit('message', {
                    targetUserId: data.receiver,
                    messages: getConversationMessage.messages
                  });
                  
                  io.to(data.receiver).emit('message', {
                    targetUserId: data.sender,
                    messages: getConversationMessage.messages
                  });
    
                // Step 8: Get all conversations where sender is involved (for sidebar update)
                const senderConversationData = await getConversation(data?.sender);
    
                // Step 9: Get all conversations where receiver is involved (for sidebar update)
                const receiverConversationData = await getConversation(data?.receiver);
     
                /*
                These emits update the chat list sidebar for both users:
                - Each user only receives their own conversation list
                - Ensures sidebar shows latest message previews and proper ordering
                */
                
                io.to(data?.sender).emit('conversation', senderConversationData);
                
                io.to(data?.receiver).emit('conversation', receiverConversationData);
        
        });

    // sidebar
    socket.on('sidebar', async(currentUserId) => {
       
        const conversation = await getConversation(currentUserId);

//The 'conversation' event is sent to display all conversations in the sidebar where the current user is either the sender or receiver.
        socket.emit('conversation', conversation);
    });


    socket.on('seen', async (msgByUserId) => {
        
            // Find and populate the conversation with messages
            let conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: user?._id, receiver: msgByUserId },
                    { sender: msgByUserId, receiver: user?._id }
                ]
            }).populate('messages');
    
            if (!conversation) return;
    
            // Get message IDs from the populated messages
            const messageIds = conversation.messages.map(msg => msg._id);
    
            // Update only messages from the other user that are unread
            await MessageModel.updateMany(
                { 
                    _id: { "$in": messageIds },
                    senderId: msgByUserId,
                    seen: false // Only update unseen messages
                },
                { "$set": { seen: true } }
            );
    
            // Get the updated conversation with messages
            const updatedConversation = await ConversationModel.findOne({
                _id: conversation._id
            }).populate('messages');
    
            // Emit the updated messages to both users in messagePage
            io.to(user?._id.toString()).emit('message', {
                targetUserId: msgByUserId,
                messages: updatedConversation.messages
              });
              
              io.to(msgByUserId).emit('message', {
                targetUserId: user?._id.toString(),
                messages: updatedConversation.messages
              });
    
            // Update conversation lists for sidebar
            const conversationSender = await getConversation(user?._id.toString());
            const conversationReceiver = await getConversation(msgByUserId.toString());
            
            io.to(user?._id.toString()).emit('conversation', conversationSender);
            io.to(msgByUserId).emit('conversation', conversationReceiver);
        
    });


    socket.on('disconnect', async () => {
        if (user?._id) {
            onlineUser.delete(user?._id.toString());
            
            // Emit to all connected users that this user went offline
            io.emit('user-status-change', {
                userId: user?._id.toString(),
                online: false
            });
            
            // Update online users list
            io.emit('onlineUser', Array.from(onlineUser));
        }
        console.log("Disconnected user", socket.id);
    });
});

module.exports = {
    app,
    server
};