import express, {Express} from 'express';
import cors from "cors"
import http from "http"
import { Server } from 'socket.io';
import cookieSession from 'cookie-session'
import passport from 'passport'

import auth from "./route/User"
import postRouter from './route/Posts';
import chatRouter from './route/Chat';
import messageRouter from './route/Message';

import DB from "../database"
import errorHandler from './middleware/errorHandler';
import { ActiveUsers, MailOptions } from './utils/interface';
import sendmessage from './utils/messager';
import "./passport"
const socketio = require('socket.io')

export class Myserver{
    private app : Express;
    private Port : number;
    private server : http.Server
    io : Server;
    
    constructor(){
        this.app = express()
        this.Port= 4400
        this.server = http.createServer(this.app)

        this.middleware()
        this.useSocket()
        this.useRoute()
        this.verify_mailer()
        this.run()
        
    }
    
    private middleware(){
        this.app.use(express.json())
        this.app.use(cors({credentials: true}))
        // this.app.use(bodyParser())
        this.app.use(cookieSession({
            name: "session",
            keys : ['campus'],
            maxAge: 60 * 60 * 24 * 100
        }))
        
        this.app.use(passport.initialize())
        this.app.use(passport.session())
    }
    public verify_mailer (){
      
        sendmessage.transporter.verify().then((data) => {
            console.log("mailer: ", data)
        }).catch(error => {
            console.log('Error: ', error)
        })

    }
    private useSocket(){
        this.io = socketio(this.server)
        const activeUsers= [] as ActiveUsers[]
        this.io.on('connect', (socket)=>{
            console.log('connected');
            socket.on('new-user-add',(new_user_id)=>{
               if(!activeUsers.some((user)=> user.userId === new_user_id)){
                activeUsers.push({
                    userId : new_user_id,
                    socketId: socket.id
                    
                })
               }
               console.log('connected users', activeUsers);
               
               this.io.emit('get_users', activeUsers)
            })
            //remove user

            socket.on('disconnect',()=>{
                activeUsers.filter((user)=> user.socketId !== socket.id)
                console.log('disconnected');
                
            })
        })
    }
    private useRoute(){
        this.app.use('/api', auth)
        this.app.use('/api', postRouter)
        this.app.use('/api', chatRouter)
        this.app.use('/api', messageRouter)

        //handling error
        this.app.use(errorHandler.validateError)
        
    }
    private run(){  
        new DB().connector()    
        this.server.listen(this.Port, () => console.log(`server is listening on ${this.Port}`))         
    }
}
(function(){
   new Myserver() 
}())