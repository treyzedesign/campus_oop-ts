import { NextFunction, Request, Response } from 'express'
import User from '../model/User'
import { hash, compare } from 'bcryptjs'
import tools from '../utils/tools'
import dotenv from 'dotenv'
import { File } from '../utils/interface'
import fs from 'fs'
import path from 'path'
import sendmessage from '../utils/messager'
import { error, log } from 'console'
import passport from 'passport'
import NewUser from '../model/NewUser'

dotenv.config()
interface User {
  id: string;
  // Other properties of the user...
}
class UserController  {

    public async register(req:Request, res: Response){
       const {fullname, username, email, password} = req.body
       try {
          if(req.body == null || req.body == undefined){
            return res.status(400).json({msg: "bad request "})
          }
          const  obj = {
            fullname: fullname,
            username: username,
            email: email,
            password: await hash(password, 10)
          }
          const new_user = new User(obj)
          await new_user.save().then(()=>{
            return res.status(201).json({msg: "created"})
          })
       } catch (error) {
          if(error.code == 11000){
            return res.status(409).json({msg: "user already exists "})
          }

          return res.status(400).json({msg: error.message})
       }
       
    }
    
    public async login(req:Request, res:Response, next: NextFunction){
      const {user, password} = req.body
      try {
         if(!req.body){
            return res.status(400).json({msg: 'bad request'})
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
                 token: accesstoken,
                 user: find_mail
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
      const user = req.user as User
      await User.find({_id: { $ne: user.id }}).then((feedback)=>{

        return res.status(200).json({
          msg: " successful",
          data: feedback
       })
       
      }).catch((err)=>{
        return res.send(err)
      })
    }

    public async get_a_user(req:Request, res:Response, next: NextFunction){
      await User.findOne({_id: req.params.id})
      .populate('followers', 'pic email username fullname')
      .populate('following', 'pic email username fullname')
      .then((feedback)=>{
        return res.status(200).json({data: feedback})
        
      })
    }

    public async login_user(req:Request, res:Response, next: NextFunction){
      const user = req.user as User
      // console.log(req.user);
      
      try {
        const query = await User.findOne({_id:user.id})
        if(query){
          return res.status(200).json({result: query})
        }
      } catch (error) {
        return res.status(400).json({msg: error.message})
        
      }
    }
    public async edit_user(req:Request, res:Response, next: NextFunction){
        const image = req.file as File
        const user = req.user as User
        console.log(image);
        try {
          const query = await User.findOne({_id:user.id})
          if (query){
            const data ={
              fullname : req.body.fullname == "" ? query.fullname : req.body.fullname,
              username : req.body.username == "" ? query.username : req.body.username,
              bio : req.body.bio == "" ? query.bio : req.body.bio,
              pic : image == null ? query.pic : await tools.cloud_upload_single(image)
            }
            const update = await User.updateOne({_id:user.id},{
              $set:{
                fullname: data.fullname,
                username: data.username,
                bio: data.bio,
                pic: data.pic
              }
            },{new:true})
            if(update){
              return res.status(200).json({
                msg:"update successful",
                data: update
              })
            }
          }else{
            return res.status(404).send('not found')
          }
        } catch (error) {
          if(error.code == 11000){
            return res.status(409).send("user with username already exist")
          }
         return res.status(500).send(error.message)
          
        }
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


    public async follow(req:Request, res:Response, next: NextFunction){
      const user = req.user as User

      await User.findByIdAndUpdate(req.body.follow_id,{
        $push: {followers: user.id}
      },{new: true}).then(async()=>{
        await User.findByIdAndUpdate(user.id,{
          $push: {following: req.body.follow_id}
        },{new:true})
      }).catch(err=>{
        return res.status(422).json({msg: err.message})
      })
    }
    public async unfollow(req:Request, res:Response, next: NextFunction){
      const user = req.user as User
      // try {
        
      // } catch (error) {
      //   return res.status(422).json({msg: error.message})
      // }
      await User.findByIdAndUpdate(req.body.unfollow_id,{
        $pull: {followers: user.id}
      },{new: true}).then(async()=>{
        await User.findByIdAndUpdate(user.id,{
          $pull: {following: req.body.unfollow_id}
        },{new:true}).then((f)=>{
          res.send(f)
        })
        
      }).catch(err=>{
        return res.status(422).json({msg: err.message})
      })
    }
    //epayplus test assessment
  //   public async add_new_user(req:Request, res:Response, next: NextFunction){
  //   const {name, email, phone} = req.body
  //   try {
  //     if(req.body == null || req.body == undefined){
  //       return res.status(400).json({msg: "bad request "})
  //     }
  //     const  obj = {
  //       name: name,
  //       email: email,
  //       phone: phone
  //     }
  //     const new_user = new NewUser(obj)
  //     await new_user.save().then(()=>{
  //       return res.status(201).json({msg: "created"})
  //     })
  //  } catch (error) {
  //     if(error.code == 11000){
  //       return res.status(409).json({msg: "user already exists "})
  //     }

  //     return res.status(400).json({msg: error.message})
  //  }
  //   }
  //   public async get_epay_user(req:Request, res:Response, next: NextFunction){
  //     await NewUser.find({}).then((feedback)=>{

  //       return res.status(200).json({
  //         msg: " successful",
  //         data: feedback
  //      })
       
  //     }).catch((err)=>{
  //       return res.send(err)
  //     })
  //   }
  //   public async edit_epay_user(req:Request, res:Response, next: NextFunction){
  //     const id = req.params.id
  //     try {
  //       const query = await NewUser.findOne({_id:id})
  //       if (query){
  //         const data ={
  //           name : req.body.name == "" ? query.name : req.body.name,
  //           email : req.body.email == "" ? query.email : req.body.email,
  //           phone : req.body.phone == "" ? query.phone : req.body.phone,
  //         }
  //         console.log(data);
          
  //         const update = await NewUser.updateOne({_id:id},{
  //           $set:{
  //             name: data.name,
  //             email: data.email,
  //             phone: data.phone
             
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
  // }

}

const userController = new UserController()
export default userController


