import express from "express";
import jwt from "jsonwebtoken"  
import {JWT_SECRET} from "@repo/backend-common";
import { middleware } from "./middleware";
import {CreateRoomSchema, CreateUserSchema, SigninSchema} from "@repo/common"
import {prisma} from "@repo/db"
import {hash, compare} from "bcrypt";

const app = express();
const PORT = 5000;
app.use(express.json());



// simple health check endpoint
app.post("/signup", async (req, res) => {
  const values = CreateUserSchema.safeParse(req.body);
  if(!values.success){
    return res.json({
      message:"invalid inputs"
    })
  }
  const saltCode= 10;
  const hashedPassword = await hash(values.data.password, saltCode);

  try{ const user_value = await prisma.user.create({
    
    data:{
      email:values.data.email,
      
      password:hashedPassword,
      
      username:values.data.name,

      name:values.data.name
    }
  })
  const Userid = user_value.id;

  res.json({
    Userid: Userid
  })}
  catch(e){
    return res.json({
      message:"email already exists"
    })
  }

});

app.post("/signin",async (req,res)=>{
  
  
  const value = SigninSchema.safeParse(req.body);
   
  if(!value.success){
    return res.json({
      message:"invalid inputs"
    })
  }
  const username= value.data.username;
  const password = value.data.password;
  
   //finding the user with the given email
  try {const user_value = await prisma.user.findUnique({
    where:{
      username : username
    }})
    if(!user_value){
      return res.json({
        message:"user not found"
      })
    }
    const Userid = user_value.id;

    // comparing password usign bcrypt compare function
    const isPasswordValid = await compare(password, user_value.password);
    if(!isPasswordValid){
      return res.json({
        message:"invalid password"
      })
    }
  
  const token =jwt.sign({Userid},JWT_SECRET);
  res.json({
    token
  })
  }catch(e){
    return res.json({
      message:"something went wrong"
    })
  }

})

interface CustomReq extends express.Request{
  Userid?:string;
}

app.post("/room",middleware, async (req:CustomReq,res)=>{
  const value = CreateRoomSchema.safeParse(req.body)
  if(!value.success){
    return res.json({
      message:"Invalid Inputs"
    })
  }
  const adminId = req.Userid;
  try{const room_value = await prisma.room.create({
    data:{
      adminId : adminId,
      name : value.data.name
    }
      
      
    })
  }

  catch(e){
    return res.json({
      message:"Room with same name already exists"
    })
  }
  

})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
