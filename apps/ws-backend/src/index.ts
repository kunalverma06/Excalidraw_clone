import WebSocket from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";
import { prisma} from "@repo/db"
import { User } from "lucide-react";
import { PrismaClient } from "../../../packages/db/generated/prisma";
import { main } from "ts-node/dist/bin";



const port = 8080
const ws= new WebSocket.Server({port});



interface User {
  ws:WebSocket,
  rooms:string[],
  Userid: string
}

const Users :User[] = []




function checkAuth(token:string):string|null{
  const decoded = jwt.verify(token,JWT_SECRET) as JwtPayload
  console.log(decoded)
  if(!decoded){
    
    return null ;
  }


  return decoded.Userid ;

}

ws.on("listening", () => {
  console.log(`WebSocket server is running at ws://localhost:${port}`);
});

ws.on("connection",function  connection(ws , request){
  
  const url = request.url ;

  if(!url){
    ws.send(JSON.stringify({
      type:"error",
      messgae:"Missing Jwt, not a valid url"

    })) 
    ws.close()
    return;
  }
  

  const queryParams = new URLSearchParams(url.split('?') [1]);
  const token = queryParams.get("token") || "";
  const Userid = checkAuth(token);
  
  if(!Userid){
    ws.close() ;
    return 
  }

  Users.push({
    Userid,
    rooms:[],
    ws
  })


 
  ws.on("message",async function message(data){
    const parsedData = JSON.parse(data as unknown as string);
    const roomId = parsedData.roomId

    //join room
    if(parsedData.type==="join_room"){
      const user = Users.find(x=>x.ws === ws)
      user?.rooms.push(parsedData.roomId);
      console.log(`${user?.Userid} joined the room`)

    }


    //leave room logic
    if(parsedData.type ==="leave_room"){
      const user = Users.find(x=>x.ws===ws);
      if (user) {
        user.rooms = user.rooms.filter(r => r !== parsedData.roomId);
      }
    }

    //draw logic 
    if(parsedData.type ==="draw"){
      const roomName = parsedData.roomName
      const message = parsedData.message
      const username= parsedData.username

      await prisma.drawing.create({
        data:{
          roomId,
          message,
          userId: Userid, 
          username
        }
      })


      Users.forEach(user=>{
        if(user.rooms.includes(roomId)){
          user.ws.send(JSON.stringify({
            type:"draw",
            message,
            roomId,
            roomName
          }));
        }
      })

    

    }

  })

})