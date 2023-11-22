import { Schema, model } from "mongoose";

interface Chats{
   members: [],
   isGroupChat : Boolean,
   groupAdmin: String
   groupPic: String
   latestMessage : String,
   chatName: String
}

const schema = new Schema<Chats>({
   members: [
      {type: Schema.Types.ObjectId, ref: "User"}
   ],
   isGroupChat : {type: Boolean, default: false},
   groupAdmin : {type: Schema.Types.ObjectId, ref: "User"},
   groupPic: String,
   latestMessage:{
      type: Schema.Types.ObjectId,
      ref: "Message"
   },
   chatName: String
},{timestamps: true})
const Chat = model<Chats>('Chat', schema)

export default Chat