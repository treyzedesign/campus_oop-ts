import { Router} from 'express'
import authorize from '../middleware/Auth';
import tools from '../utils/tools';
import { NextFunction, Request, Response } from 'express'

import chatController from '../controller/Chats';
var summary = require('node-sumuparticles');

class ChatRoute {
   public Router: Router;
   constructor(){
      this.Router = Router()
      this.posters()
      this.getters()
      this.editors()
      this.removers()
   }
   public posters (){
        this.Router.post('/create_chat', authorize.Authuser, chatController.create_chat)
                    .post("/summarize",async (req: Request, res: Response, next: NextFunction)=>{
                        summary.summarize( "https://www.premiumtimesng.com/promoted/635147-historic-day-as-lagos-film-city-becomes-a-reality-with-groundbreaking-in-ejinrin-epe.html", function(title:any, summary:any, failure:any) {
                            if (failure) {
                                console.log("There was an error.");
                            }
                            res.status(200).json({
                                title: title,
                                summary: summary
                            })
                        });
                    })
                    .post('/chat-bot', authorize.Authuser, chatController.chat_bot)
                    .post('/create_group_chat', authorize.Authuser, chatController.create_group_chat)
   }
   public getters (){
        this.Router.get('/get_user_chat/:userId', chatController.get_user_chat)
                    .get('/find_chat/:user1/:user2', chatController.find_chat)
                    .get('/get_all_chats', chatController.get_all_chat)
   }
   public editors (){
        this.Router.patch("/edit_group_name/:chatId", authorize.Authuser, chatController.rename_group)
                   .patch("/add_to_group/:chatId", authorize.Authuser, chatController.add_users_to_group)
   }
   public removers (){
   }

}
const chatRouter = new ChatRoute().Router
export default chatRouter
 
