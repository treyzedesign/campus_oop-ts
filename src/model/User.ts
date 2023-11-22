import { Model, Mongoose, Schema, model } from "mongoose";

interface Users{
    fullname: String,
    username : String,
    email: String,
    password: String,
    isVerified: Boolean,
    pic: String
    bio: String,
    createdAt: Date
}

const schema = new Schema<Users>({
    fullname: {type: String, required: true},
    username:{type:String, required: true, unique:true},
    email: {type:String, required: true, unique:true},
    password: {type:String, required: true},
    pic:{type: String, default: "https://res.cloudinary.com/dt4ke0max/image/upload/v1697650750/p6tvl6nzzafzxv1n6tpd.png"},
    bio: {type: String},
    isVerified:{type: Boolean, default: false},
    createdAt: {type:Date, default: new Date()}
})
const User = model<Users>('User', schema)

export default User