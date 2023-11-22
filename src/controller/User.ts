import { NextFunction, Request, Response } from 'express'
import User from '../model/User'
import { hash, compare } from 'bcryptjs'
import tools from '../utils/tools'
import dotenv from 'dotenv'
import { File } from '../utils/interface'
import fs from 'fs'
import path from 'path'
import sendmessage from '../utils/messager'
import { error } from 'console'
import passport from 'passport'
dotenv.config()

class UserController  {

    public async register(req:Request, res: Response){
       const {fullname, username, email, password} = req.body
       try {
          if(req.body == null || req.body == undefined){
            return res.status(400).send("bad request")
          }
          const  obj = {
            fullname: fullname,
            username: username,
            email: email,
            password: await hash(password, 10)
          }
          const new_user = new User(obj)
          await new_user.save().then(()=>{
            return res.status(201).send(" user created successfully")
          })
       } catch (error) {
          if(error.code == 11000){
            return res.status(409).send("user with email/username already exist")
          }

          return res.send(error.message)
       }
       
    }
    
    public async login(req:Request, res:Response, next: NextFunction){
      const {user, password} = req.body
      try {
         if(!req.body){
            return res.status(400).send("bad request")
          }else{
            const find_mail = await User.findOne({$or: [{email: user}, {username: user}]})
            if(find_mail){
              const pass = find_mail.password.toString()
              const compare_password = await compare(password, pass)
              if(!compare_password){
                return res.status(404).json({msg: 'incorrect password'})
              }
              const accesstoken = tools.accesstoken({id: find_mail._id, email: find_mail.email})
              return res.status(200).json({
                 msg: "login successfull",
                 token: accesstoken
              })
            }else{
              return res.status(404).json({msg: 'you are not a registered user, please register'})
            }
          }  
      } catch (err) {
         return res.status(500).send(err)
      }
    }
    //Google auth
    public async google(req:Request, res:Response, next: NextFunction){
        await passport.authenticate('google', { scope: ['profile'] })
    }
    
    public async google_cb(req:Request, res:Response, next: NextFunction){
        await passport.authenticate('google', {
          successRedirect: process.env.CLIENT_URL,
          failureRedirect: '/login/failed'
        })
        
     
    
    } 

    public async login_success(req:Request, res:Response, next: NextFunction){
        if(req.user){
          return res.status(200).json({user:req.user})
        }else{
          return res.status(400).json({msg: 'not autorized'})

        }
    }
    public async login_failed(req:Request, res:Response, next: NextFunction){
        return res.status(401).json({msg: 'login failure'})
    }


    public async get_all_user(req:Request, res:Response, next: NextFunction){
      await User.find({}).then((feedback)=>{
        return res.status(200).json({
          msg: " successful",
          data: feedback
       })
      }).catch((err)=>{
        return res.send(err)
      })
    }
    public async edit_user(req:Request, res:Response, next: NextFunction){
    //     const image = req.file as File
    //     try {
    //       const query = await User.findOne({_id:req.user.id})
    //       if (query){
    //         const data ={
    //           fullname : req.body.fullname == "" ? query.fullname : req.body.fullname,
    //           username : req.body.username == "" ? query.username : req.body.username,
    //           bio : req.body.bio == "" ? query.bio : req.body.bio,
    //           pic : req.file == null ? query.pic : await tools.cloud_upload_single(image)
    //         }
    //         const update = await User.updateOne({_id:req.user.id},{
    //           $set:{
    //             fullname: data.fullname,
    //             username: data.username,
    //             bio: data.bio,
    //             pic: data.pic
    //           }
    //         },{new:true})
    //         if(update){
    //           return res.status(200).json({
    //             msg:"update successful",
    //             data: update
    //           })
    //         }
    //       }else{
    //         return res.status(404).send('not found')
    //       }
    //     } catch (error) {
    //       if(error.code == 11000){
    //         return res.status(409).send("user with username already exist")
    //       }
    //      return res.status(500).send(error.message)
          
    //     }
    }

    public async delete_all (req:Request, res:Response, next: NextFunction){
        await User.find({}).deleteMany().then((feedback)=>{
          return res.status(200).json({
            msg: " successful",
            data: feedback
         })
        }).catch((err)=>{
          return res.send(err)
        })
    }
    
    public async retrieve_password(req:Request, res:Response, next: NextFunction){
      const {email} = req.body
      try {
        const find_email = await User.findOne({email:email})
        if(!find_email){
          return res.status(404).json({msg:"email does not exist"})
        }
        
        const html =  fs.readFile("index.html",async (err, data)=>{
          if(err){
            res.json({msg: err});
          }
          console.log(data.toString('utf-8'));
          const mail = {
            from : process.env.USER,
            to: email,
            subject : "Change of password",
            html: data.toString('utf-8')
          }
          await sendmessage.sendmail(mail).then((feedback)=>{
            return res.status(200).send(feedback)
          }).catch(error=>{
            console.log(error)
          })
        })        
    
       
      } catch (error) {
        return res.status(500).send(error.message)
      }
    }
}
const userController = new UserController()
export default userController


