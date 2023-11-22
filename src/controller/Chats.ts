import { NextFunction, Request, Response } from 'express'
import tools from '../utils/tools'
import dotenv from 'dotenv'
import Chat from '../model/Chat'
import {  OpenAI} from 'openai'
import User from '../model/User'
dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.GPT_KEY2, // defaults to process.env["OPENAI_API_KEY"]
});
interface User {
    id: string;
    // Other properties of the user...
  }
class ChatController{
   public async create_chat(req: Request, res: Response, next: NextFunction){
    const user = req.user as User
    const senderId = user.id
    // const newChat = new Chat({
    //     members: [senderId, req.body.receiver]
    // })
    const {receiver} = req.body
    //    const result = await newChat.save()
    //    return res.send(result)
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
          { members: { $elemMatch: { $eq: senderId } } },
          { members: { $elemMatch: { $eq: receiver } } },
        ],
      }).populate('members', "-password")
        .populate('latestMessage')

    var isChats = await User.populate(isChat,{
        path: "latestMessage.sender",
        select: "username pic"
    })

    if(isChats.length > 0){
        return res.json({msg: isChat[0]})
    }else{
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            members: [senderId, receiver],
          };
        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
              "members",
              "-password"
            );
            res.status(200).json(FullChat);
    
        } catch (error) {
            return res.status(400).json({msg: error.message})
        }
    }
   
   }

   public async chat_bot(req: Request, res: Response, next: NextFunction){
    const prompt = req.body.message
        const chat = await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: prompt,
            max_tokens: 4000,
            temperature: 1
        })
        
        return res.json({msg: chat.choices[0].text})
   }

   public async get_user_chat(req: Request, res: Response, next: NextFunction){
    try {
        const result = await Chat.find({
            members : {$in:[req.params.userId]}
        }).populate("members", "-password")
          .populate("groupAdmin", "-password")
          .populate("latestMessage")
          .sort({updatedAt: -1})
        
        // let results = await User.populate(result, {
        //     path: "latestMessage.sender",
        //     select: "fullname pic email",
        // })
            return res.send(result)
          
    } catch (error) {
        return res.status(400).json({msg: error.message})
        
    }
   }
 
   public async find_chat(req: Request, res: Response, next: NextFunction){
    try {
       const chats = await Chat.findOne({
            members: {$all : [req.params.user1, req.params.user2]}
       })
       return res.status(200).send(chats)

    } catch (error) {
        return res.status(400).json({msg: error.message})
        
    }
   }
   public async get_all_chat(req: Request, res: Response, next: NextFunction){
    try {
       const chats = await Chat.find({})
                               .populate('members', 'username pic')
                               .populate('latestMessage', 'message')
       return res.send(chats)
    } catch (error) {
        return res.status(400).json({msg: error.message})
        
    }
   }

   public async create_group_chat(req: Request, res: Response, next: NextFunction){
    const user = req.user as User
    
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the feilds" });
    }
    const users = req.body.users
    if (users.length < 2) {
        return res
          .status(400)
          .send("More than 2 users are required to form a group chat");
    }

    const find_User = await User.findOne({_id: user.id}).select("-password")
    users.push(find_User)
    try {
        const GroupChat = await Chat.create({
            chatName: req.body.name,
            members: users,
            isGroupChat: true,
            groupAdmin: find_User
        })

        const fullGroupChat = await Chat.findOne({ _id: GroupChat._id })
                                        .populate("members", "-password")
                                        .populate("groupAdmin", "-password");
        return res.status(200).send(fullGroupChat)
    } catch (error) {
        return res.status(400).json({msg: error.message})
        
    }
   }
   public async rename_group (req: Request, res: Response, next: NextFunction){
        const {name}= req.body
        try {
            const update_group_name = await Chat.findByIdAndUpdate(req.params.chatId,{
                $set:{chatName: name}
            },{new: true})
            if(update_group_name){
                return res.status(200).json({
                    msg: "updated successfully",
                    data: update_group_name
                })
            }else{
                return res.status(404).json({msg: 'not found'})           
            }
        } catch (error) {
            return res.status(400).json({msg: error.message})           
        }
         
    }
    
    public async add_users_to_group (req: Request, res: Response, next: NextFunction){
        const {users} = req.body
        const user = req.user as User

        try {
            const added = await Chat.findOne({$and:[
                {_id: req.params.chatId},
                {isGroupChat: true},
                {groupAdmin: user.id}
            ]}).updateOne(
                {_id:req.params.chatId},
                {
                  $push: { members: { $each: users } }, // Use $each to add multiple users
                },
                {
                  new: true,
                }
              ).then((f)=>{
                return res.send(f)
              })
            
           
        } catch (error) {
            return res.status(400).json({msg: error.message})           
            
        }

    }
}

const chatController = new ChatController()
export default chatController