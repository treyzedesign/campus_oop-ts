
interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}


interface Like {
    id: string; // Assuming the 'id' property is a string
} 

interface ActiveUsers{
    userId: string,
    socketId : String
}

interface MailOptions{
    host: String,
    port: String,
    secure: Boolean,
    auth: {}
}

interface User {
    id: string;
    // Other properties of the user...
  }
export {File, Like, ActiveUsers, MailOptions, User}