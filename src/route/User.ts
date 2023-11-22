import { Router} from 'express'
import {Myserver} from "../index";
import userController from '../controller/User';
import errorHandler from '../middleware/errorHandler';
import validator from '../middleware/Validator';
import {validate} from 'express-validation'
import authorize from '../middleware/Auth';
import tools from '../utils/tools';
class UserRoute {
   public Router: Router;
   constructor(){
      this.Router = Router()
      this.posters()
      this.getters()
      this.editors()
      this.removers()
   }
   public posters (){
      this.Router.post("/register", validate(validator.registerValidation),userController.register)
                  .post('/login', validate(validator.loginValidation), userController.login)
                  .post('/retrieve_password', userController.retrieve_password)
         

   }
   public getters (){
      this.Router.get("/get_all_users", userController.get_all_user)
                 .get('/google', userController.google)
                 .get('/auth/google/callback', userController.google_cb)
                 .get('/login/failed', userController.login_failed)
   }
   public editors (){
      this.Router.patch('/edit_user', authorize.Authuser, tools.multer_upload().single('pic'), userController.edit_user)
   }
   public removers (){
    this.Router.delete('/delete_all', userController.delete_all)
   }

}
const auth = new UserRoute().Router
export default auth
 
