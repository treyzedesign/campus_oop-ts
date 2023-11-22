import Posts from "../model/Posts";
import { NextFunction, Request, Response } from 'express'
import tools from '../utils/tools'
import dotenv from 'dotenv'
import { File, Like } from "../utils/interface";
import { table } from "console";
import {load} from "cheerio";
import axios from 'axios'
import { User } from "../utils/interface";
dotenv.config()


class PostController{
    
    public async create(req: Request, res: Response, next: NextFunction){
      const {text}= req.body
      const user = req.user as User
      try {
        const files = req.files as File[]
        const data = {
            userId : user.id,
            text: text,
            pic: await tools.cloud_upload_many(files)
        }
        const make_post = await Posts.create(data)
        if(make_post){
            return res.status(201).json({
                msg: 'done',
                data: make_post
            })
        }    
      } catch (error) {
        return res.status(500).send(error)
      }
    }

    public async get_all_posts(req: Request, res: Response, next: NextFunction) {
        try {
            const query = await Posts.find({})
            if (query.length < 1){
                return res.status(404).json({msg: "no posts"})
            }
    
            return res.status(200).json({
                msg: "available posts",
                data: query
            })
        } catch (error) {
        return res.status(500).send(error)
            
        }
    }

    public async get_a_post(req: Request, res: Response, next: NextFunction){
        const post_id = req.params.id
        try {
            const query = await Posts.find({_id:post_id})
            if (query.length < 1){
                return res.status(404).json({msg: "could not find post"})
            }
    
            return res.status(200).json({
                msg: "post available",
                data: query
            })
        } catch (error) {
        return res.status(500).send(error)
            
        }
    }
    
    public async get_user_post(req: Request, res: Response, next: NextFunction){
        const userId = req.params.userId 
        try {
            const query = await Posts.find({userId:userId})
            if (query.length < 1){
                return res.status(404).json({msg: "could not find post"})
            }
    
            return res.status(200).json({
                msg: "post available",
                data: query
            })
        } catch (error) {
            return res.status(500).send(error.message)
            
        }
    }
    async perform_scraping(){
        const arr = []
        const axiosResponse = await axios.request({
            method: "GET",
            url: "https://www.jumia.com.ng/flash-sales/",
            headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
            }
        })
        const $ = load(axiosResponse.data)
        const html = $('.name')
        arr.push(html)
        console.log(arr);
        
    }
    public async get_trends(){
        // console.log(this.perform_scraping);
        const arr = []
        const axiosResponse = await axios.request({
            method: "GET",
            url: "https://www.jumia.com.ng/flash-sales/",
           
        })
        const $ = load(axiosResponse.data)
        const html = $('info').find('name')
        arr.push(html)
        console.log(arr);
    }
    public async get_login_user_post(req: Request, res: Response, next: NextFunction){
        const user = req.user as User
        try {
            const query = await Posts.find({userId:user.id})
            if (query.length < 1){
                return res.status(404).json({msg: "could not find post", data: user.id})
            }
    
            return res.status(200).json({
                msg: "post available",
                data: query
            })
        } catch (error) {
        return res.status(500).send(error.message)
            
        }
    }

    public async comment(req: Request, res: Response, next: NextFunction){
        const {text, postId}= req.body
        const user = req.user as User
            const comment ={
                postedBy: user.id,
                text: text
            }
            await Posts.findOneAndUpdate({_id:postId},{
                $push: {comments:comment}
            },{
                new:true
            }).populate('comments.postedBy', '_id username').then((feedback)=>{
                res.send(feedback);
                
            }).catch(err=>{
                res.send(err);
                
            })
        
    }
    
    public async like(req: Request, res: Response, next: NextFunction){
        const postId= req.params.id
        const user = req.user as User
        try {
            const query = await Posts.findOne({_id:postId})
            let like = query.likes as Like[]
            let checker = like.map(like=> like.id)
            if(checker.includes(user.id)){
                return res.status(400).send("you cant like the same post twice")
            }else{
                await Posts.findOneAndUpdate({_id:postId},{
                    $push: {likes: {
                        id: user.id
                    }}
                },{
                    new:true
                }).then((feedback)=>{
                    res.send(feedback.likes)
                    
                }).catch(err=>{
                    res.send(err);
                    
                })
            }
           
        } catch (error) {
            return res.status(500).send(error.message)
            
        }
            
        
    }
    
    public async unlike(req: Request, res: Response, next: NextFunction){
        const postId= req.params.id
        const user = req.user as User
        
        try {
            await Posts.findOneAndUpdate({_id:postId},{
                $pull: {likes: {
                    id: user.id
                }}
            },{
                new:true
            }).then((feedback)=>{
                res.send(feedback.likes)
                
            }).catch(err=>{
                res.send(err);
                
            })
        } catch (error) {
            return res.status(500).send(error.message)
            
        }
            
        
    }



}

const postController = new PostController()
export default postController
