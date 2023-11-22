import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { Request , Response, NextFunction} from 'express'
dotenv.config()
declare global {
    namespace Express {
      interface MyRequest {
        id: string
      }
    }
  }
interface User {
    id : String
}
class Authorize{
    public Authuser(req:Request, res:Response, next:NextFunction){
        const header = req.headers.authorization
        const token = header.split(" ")[1]
        try {
            if(!token){
                return res.status(403).json({
                    msg: "forbidden access"
                })
            }else{
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,decode)=>{
                    if(err){
                        return res.status(401).json({
                            error: err,
                            message: "Unauthorized Action, expired token"
            
                        })
                    }
                        req.user = decode
                        next()
                    
                })
            }
        } catch (error) {
            return res.status(400).json({
                message: error.message
    
            })
        }
    }
}
const authorize = new Authorize()
export default authorize