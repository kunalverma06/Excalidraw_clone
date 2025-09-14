import express from "express";
import jwt from "jsonwebtoken"  
import {JWT_SECRET} from "@repo/backend-common";
import { middleware } from "./middleware";
import {CreateRoomSchema, CreateUserSchema, SigninSchema} from "@repo/common"


const app = express();
const PORT = 3001;

// simple health check endpoint
app.post("/signup", (req, res) => {
  const data = CreateUserSchema.safeParse(req.body);
  if(!data){
    return res.json({
      message:"invalid inputs"
    })
  }

});

app.post("/signin",(req,res)=>{
  
  
  const value = SigninSchema.safeParse(req.body);
   
  if(!value.success){
    return res.json({
      message:"invalid inputs"
    })
  }
  const username= value.data.username;
  
  const token =jwt.sign({username},JWT_SECRET);

  res.json({
    token
  })


})

app.post("/room",middleware,(req,res)=>{
  const value = CreateRoomSchema.safeParse(req.body)
  if(!value.success){
    return res.json({
      message:"Invalid Inputs"
    })
  }
  

})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
