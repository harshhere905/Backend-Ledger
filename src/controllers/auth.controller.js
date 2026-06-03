import express from 'express';
import User from '../models/user.models.js';
import BlackList from '../models/blackList.models.js';
import jwt from 'jsonwebtoken'
import { sendRegistrationEmail } from '../services/email.services.js';

const registerUser = async(req,res)=>{
    try{
      const {email,name,password}=req.body;
      const isExists=await User.findOne({
        email
      })
      if(isExists){
         return res.status(422).json({
            message: "user already exists!! Please Login..",
            status: "failed"
         })
         return
      }
      const user = await User.create({
        email,
        name,
        password
      })
      const token=jwt.sign(
        {
          userId:user._id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "3d"
        }
      )
      res.cookie("token",token);
      await sendRegistrationEmail(user.email,user.name);
      return res.status(201).json({
        message: "User registered successfully",
        data: user
      })
    }
    catch(err){
       return res.status(400).json({
         message:err.message,
         status:false
       })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email
        }).select("+password +systemUser");

        if (!user) {
            return res.status(401).json({
                message: "User not registered!!"
            });
        }

        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Password or email is INVALID"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                systemUser: user.systemUser
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "3d"
            }
        );

        res.cookie("token", token);

        return res.status(200).json({
            message: "Login Successful"
        });
    }
    catch (err) {
        return res.status(400).json({
            message: "Login Failed!!",
            error: err.message
        });
    }
}

const logoutUser = async(req, res) => {
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1]
    if(!token){
      res.status(200).json({
        message: "Logout successful"
      })
    }
    res.clearCookie("token");
    await BlackList.create({
        token: token
    })
    return res.status(200).json({
       message: "Logout successful"
    })
}


export {registerUser,loginUser,logoutUser}
