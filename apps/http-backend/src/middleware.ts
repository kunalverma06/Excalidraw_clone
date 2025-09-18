import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";


interface CustomReq extends Request{
    Userid?:string;
}

export const middleware =(req:CustomReq ,res:Response, next:NextFunction)=>{
    const token = req.headers["authorization"]?? "";
    const decoded = jwt.verify(token,JWT_SECRET) as JwtPayload;

    if (decoded){
        req.Userid = decoded.Userid;
        next()
    }
    else{
        res.status(403).json({
            message:"Unauthorized"
        })
    }
    

}