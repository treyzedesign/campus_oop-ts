import dotenv from 'dotenv'
import { Twilio } from "twilio";
import { Myserver } from '..';
import { Transport, createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
dotenv.config()


class Messager{
    private data : Object
    public transporter : Mail
    constructor(){
        this.data = {
            host: process.env.HOST,
            port: process.env.EMAIL_PORT,
            secure: true,
            tls: {
                rejectUnauthorized: false,
                // minVersion: "TLSv1.2"
            },
            auth: {
              user: process.env.USER,
              pass: process.env.PASS,
            }
        } 
        this.transporter = createTransport(this.data)

    
    }
    public sendmail(data: object){
      return this.transporter.sendMail(data)
    }
}

const sendmessage = new Messager()
export default sendmessage