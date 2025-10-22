import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";


interface CustomReq extends Request{
    userId?:string;
}

export const middleware =(req:CustomReq ,res:Response, next:NextFunction)=>{
    const token = req.cookies.token
    
    const decoded = jwt.verify(token,JWT_SECRET) as string;
    if (decoded){
        req.userId = decoded;
        next();
    }
    else{
        res.status(403).json({
            message:"Unauthorized"
        })
    }
    

}