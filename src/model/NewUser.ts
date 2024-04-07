import { Model, Mongoose, Schema, model } from "mongoose";

interface NewUsers{
    name: String,
    email: String,
 phone : String
}

const schema = new Schema<NewUsers>({
    name: {type: String, required: true},
    email: {type:String, required: true, unique:true},
   phone:  {type: String, required: true}
})
const NewUser = model<NewUsers>('NewUser', schema)

export default NewUser