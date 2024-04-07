import { Model, Mongoose, Schema, model } from "mongoose";

interface Posts{
    userId: String,
    text: String,
    pic : [],
    likes: [],
    comments: [],
    shares: []
}

const schema = new Schema<Posts>({
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    text: {type: String},
    pic: [{type:String}],
    likes: [{type:Schema.Types.ObjectId, ref: 'User'}],
    comments: [
        {
            postedBy: {type:Schema.Types.ObjectId, ref: 'User'},
            text:String
        }
    ]   ,
    shares: []

}, {timestamps: true})
const Posts = model<Posts>('Post', schema)

export default Posts