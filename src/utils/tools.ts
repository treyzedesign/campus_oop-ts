import jwt from "jsonwebtoken"
import multer from 'multer'
import cloudinary from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
   })
class Tools{
    protected token : string
    protected single_file : String
    public accesstoken(pay:any){
        try {
            this.token = jwt.sign(pay, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '7d'
            })         
            return this.token.toString()
        } catch (error) {
            return error
        }
      
    }

    public multer_upload(){
        const storage = multer.diskStorage({
            filename: function (req, file, cb) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
                cb(null, "schola" + '-' + uniqueSuffix + file.originalname)
              }
        })
        const upload = multer({
            storage:storage,
            limits:{fieldSize: 1024 * 1024 * 24} //24mb
        })
        return upload
    }
    public async cloud_upload_many(files:any){
     
        const uploaded_files:any = [] ;
        for(const file of files){
           await cloudinary.v2.uploader.upload(file.path,{
                folder:"schola_user_posts"
            }).then((feedback)=>{
                uploaded_files.push(feedback.secure_url)
            })
        }
        return uploaded_files
    }  
    public async cloud_upload_single(file:any){
        // cloudinary.v2.config({
        //     cloud_name: process.env.CLOUD_NAME,
        //     api_key: process.env.API_KEY,
        //     api_secret: process.env.API_SECRET
        //    })
           await cloudinary.v2.uploader.upload(file.path,{
                folder:"schola_profile_pic"
            }).then((feedback)=>{
                this.single_file = feedback.secure_url
            })
        return this.single_file
    }  
}
const tools = new Tools()
export default tools