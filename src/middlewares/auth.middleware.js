import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';
import BlackList from '../models/blackList.models.js';

const authMiddleware=async(req,res,next)=>{
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1]
    if(!token){
        return res.status(401).json({
            message:"token is missing"
        })
    }
    const blacklisted = await BlackList.findOne({
        token: token
    });
    if (blacklisted){
        res.status(401).json({
            message: "token is blacklisted. Please login Again!!"
        })
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded
        next();
    }
    catch(err){
        return res.status(400).json({
            message:"token is invalid",
            err:err.message
        })
    }
}
const authSystemUserMiddleware = async (req, res, next) => {
    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "token is missing"
        });
    }
    const blacklisted = await BlackList.findOne({
        token: token
    });
    if (blacklisted){
        res.status(401).json({
            message: "token is blacklisted. Please login Again!!"
        })
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        if (!decoded.systemUser) {
            return res.status(403).json({
                message: "Access denied. System user required."
            });
        }
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(400).json({
            message: "token is invalid",
            err: err.message
        });
    }
};
export {authMiddleware, authSystemUserMiddleware}