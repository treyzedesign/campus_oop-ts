import { Schema, model } from "mongoose";

interface Messages{
   sender : any,
   chatId: any,
   message : Object
   chat: any
}

const schema = new Schema<Messages>({
   sender : {
        type: Schema.Types.ObjectId,
        ref: 'User'
   },
   chatId : {
    type: Schema.Types.ObjectId,
    ref: 'Chat'
    },
   message: {
    text: {type:String},
    file: []
   },
   chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat'
  }
},{timestamps: true})
const Message = model<Messages>('Message', schema)

export default Message