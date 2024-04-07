import { Errback, NextFunction, Request, Response } from "express"
import { ValidationError} from 'express-validation'
// import { Error } from "mongoose";
import dotenv from 'dotenv'
dotenv.config()
class ErrorHandler{
     public Error(err: Error, req: Request, res: Response, next: NextFunction){
        console.log("Middleware Error Hadnling");
        // console.log(err)
        const errStatus = 500 || 400 ||404
        const errMsg = err.message ;
        res.status(errStatus).json({
            name: err.name,
            success: false,
            status: errStatus,
            message: errMsg,
            stack: process.env.NODE_ENV === 'development' ? err.stack : {}
        })
     }

     public validateError(err: Error, req: Request, res: Response, next: NextFunction){
        if (err instanceof ValidationError) {
            return res.status(err.statusCode).json(err)
          }
          console.log(err);
          
          return res.status(500).json(err.message)
     }
}
const errorHandler = new ErrorHandler()
export default errorHandler