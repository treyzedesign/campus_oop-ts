import { Router} from 'express'
import postController from '../controller/Posts';
import tools from '../utils/tools';
import authorize from '../middleware/Auth';
import validator from '../middleware/Validator';
import { validate } from 'express-validation'
import errorHandler from '../middleware/errorHandler';
class PostRoute {
   public Router: Router;
   constructor(){
      this.Router = Router()
      this.posters()
      this.getters()
      this.editors()
      this.removers()
   }
   public posters (){
    this.Router.post('/create-post', 
               validate(validator.postValidation),
                tools.multer_upload().any(),
                 authorize.Authuser,
                 postController.create
      )             
   }  
   public getters (){
    this.Router.get('/getPosts',postController.get_all_posts)
               .get('/get_a_post/:id', postController.get_a_post)
               .get('/get_user_posts/:userId', postController.get_user_post)
               .get('/get_login_user_posts', authorize.Authuser,postController.get_login_user_post)
               .get('/trend', postController.get_trends)
   }
   public editors(){
    this.Router.put('/comment/:id', authorize.Authuser, postController.comment)
               .put('/like/:id', authorize.Authuser, postController.like)
               .put('/unlike/:id', authorize.Authuser, postController.unlike)
   }

   public removers (){
      this.Router.delete('/delete_post/:id', authorize.Authuser, postController.delete_posts)
   }
}
const postRouter = new PostRoute().Router
export default postRouter 