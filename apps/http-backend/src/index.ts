import express from "express";
import jwt from "jsonwebtoken"  
import {JWT_SECRET} from "@repo/backend-common/config";
import { middleware } from "./middleware";


const app = express();
const PORT = 3001;

// simple health check endpoint
app.get("/", (req, res) => {
  res.send("✅ Backend is working!");
});

app.post("/signin",(req,res)=>{
  const {username,password,email}=req.body;
  const token =jwt.sign(email,JWT_SECRET);

  res.json({
    token
  })


})

app.post("/room",middleware,(req,res)=>{

})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
