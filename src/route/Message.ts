import { Router} from 'express'
import authorize from '../middleware/Auth';
import tools from '../utils/tools';
import messageController from '../controller/Message';


class MessageRoute {
   public Router: Router;
   constructor(){
      this.Router = Router()
      this.posters()
      this.getters()
      this.editors()
      this.removers()
   }
   public posters (){
      this.Router.post('/create_message', authorize.Authuser, messageController.create_message)
   }
   public getters (){
      this.Router.get('/get_message/:chatId', messageController.get_message)
   }
   public editors (){
   }
   public removers (){
   }

}
const messageRouter = new MessageRoute().Router
export default messageRouter
 
