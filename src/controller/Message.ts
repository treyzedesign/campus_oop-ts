import { NextFunction, Request, Response } from 'express'
import tools from '../utils/tools'
import dotenv from 'dotenv'
import Message from '../model/message'
import User from '../model/User'
import Chat from '../model/Chat'
interface User{
  id: string
}
class MessageController{
   public async create_message(req:Request, res:Response, next: NextFunction){
    const user = req.user as User

    const message = {
        sender: user.id,
        chatId: req.body.chatId,
        message: {
            text: req.body.text
        }
    }
    try { 
       var result = await Message.create(message)
       result = await result.populate('sender', 'username pic')
       result = await result.populate('chat')   
       let results = await User.populate(result, {
        path: 'chat.members',
        select: "name pic email"
       })
       await Chat.findByIdAndUpdate(req.body.chatId, {
         $set: {latestMessage: results}
       })
       return res.status(200).send(results)
        
    } catch (error) {
        return res.status(500).send(error.message)
        
    }
   }

   public async get_message(req:Request, res:Response, next: NextFunction){
      try {
        const result = await Message.find({chatId: req.params.chatId})
                                    .populate('sender', 'username pic')
                                    .populate('chat')
        return res.status(200).send(result)
      } catch (error) {
        return res.status(500).send(error)
      }
   }
 }
 
 const messageController = new MessageController()
 export default messageController