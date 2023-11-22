import { Model, Mongoose, Schema, model } from "mongoose";

interface Posts{
    userId: String,
    text: String,
    pic : [],
    likes: [],
    comments: [],
    createdAt: Date
}

const schema = new Schema<Posts>({
    userId: {type: String, ref: 'User'},
    text: {type: String, required: true},
    pic: [{type:String}],
    likes: [{
        id: String
    }],
    comments: [
        {
            postedBy: {type:Schema.Types.ObjectId, ref: 'User'},
            text:String
        }
    ],
    createdAt: {type:Date, default: new Date()}

})
const Posts = model<Posts>('Post', schema)

export default Posts