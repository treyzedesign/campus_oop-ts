import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()
export default class DB {
    
    public connector(){
        mongoose.connect(`${process.env.DB_URI}`).then(()=>{
            console.log("db connected succesfully")
        }).catch((err)=>{
            console.log(err.message)
        })
    }
}

