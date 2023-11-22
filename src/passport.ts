
import { Strategy } from "passport-google-oauth2";
import passport from "passport";
import { hash } from "bcryptjs";
import dotenv from 'dotenv';
import User from "./model/User";
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
dotenv.config()
passport.use(
    new GoogleStrategy({
        clientID: `${process.env.CLIENT_ID}`,
        clientSecret: `${process.env.CLIENT_SECRET}`,
        callbackURL: "http://localhost:4400/api/auth/google/callback",
        passReqToCallback   : true
    },function(request: any, accessToken: any, refreshToken: any, profile: any, done: (arg0: any, arg1: any) => any) {
        User.find({ googleId: profile.id }, function (err: any, user: any) {
          return done(err, user);
        });
      })
)

passport.serializeUser((user:any, done)=>{
    done(null,user.id)
})
passport.deserializeUser(async(email: any, done)=>{
    const user = await User.findOne({email:email})
    done(null, user)
})
