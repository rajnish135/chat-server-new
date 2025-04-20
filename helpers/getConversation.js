const {ConversationModel} = require("../models/ConversationModel");

const getConversation = async(currentUserId)=>{
  
        // Validate currentUserId to prevent empty string
        if (!currentUserId || currentUserId === '') 
        return [];
        

        //finds all conversations where the current user is either the sender or receiver
        const currentUserConversation = await ConversationModel.find({
            "$or" : [
                {sender: currentUserId},
                {receiver: currentUserId}
            ]                                 
        }).populate('messages').populate('sender').populate('receiver').sort({updatedAt: -1});
    

/*Iterating over the currentUserConversation array using .map(), and for each conversation, we create a new object containing the conversation ID, sender, receiver, count of unseen messages, and the last message.

Q.WHY WE ARE CREATING THIS ARRAY OF OBJECTS?
We create this array of objects('conversation') to return summarized conversation details (sender, receiver, unseen messages, last message) for the current user to the frontend.
*/
        const conversation = currentUserConversation.map((conv) => 
        {
            // Count the number of unseen messages in a conversation
                const countUnseenMsg = conv?.messages?.reduce((prev, curr) => 
                {
                    // Convert current message's sender ID to string for consistent comparison
                    const msgByUserId = curr?.senderId?.toString();
                    
                    // Check if the message was sent by someone other than the current user
                    if (msgByUserId !== currentUserId?.toString()) 
                    {
                        // If message is unseen (seen=false), add 1 to count, otherwise add 0
                        return prev + (curr?.seen ? 0 : 1);
                    } 
                    else {
                        // If message was sent by current user, don't count it
                        return prev;
                    }
                }, 0); // Start counting from 0

            return {
                _id: conv?._id,
                sender: conv?.sender,
                receiver: conv?.receiver,
                unseenMsg: countUnseenMsg,
                lastMsg: conv.messages.length > 0 ? conv.messages[conv.messages.length-1] : null
            };
        });

        return conversation;
} 
   

module.exports = getConversation