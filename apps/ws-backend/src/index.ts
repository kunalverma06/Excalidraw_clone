import { WebSocketServer ,WebSocket} from "ws";
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common";


const PORT = 8080;

interface UserSchema{
  Userid:string;
  rooms:string[];
  ws:WebSocket;
}

const Users:UserSchema[] = []






const wss = new WebSocketServer({ port: PORT });

 function chekUser( token:string )  {
  try {const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

  const Userid = decoded.Userid 
  
  if(!decoded || !decoded.Userid){
    console.log("inside")
    return null ;
  }
  
  return decoded.Userid
  
 }catch(e){
  return null 
 }
 }


  wss.on("connection",function connection(ws, req) {
    
    const url = req.url;
    if(!url){
      return;
    }
    

    const queryParams = new URLSearchParams(url.substring(1));
    const token = queryParams.get("token") || "";
    const userId = chekUser(token)
    console.log(userId)
    
    if( !userId){
      
      ws.close();
      return null;
    }
    console.log("reached here")

    Users.push({Userid:userId,rooms:[],ws})

    ws.on("message", function message(data) {
      const parsedData = JSON.parse(data as unknown as string);
      
      if(parsedData.type ==="join_room"){
        const user = Users.find((user)=> user.ws=== ws)
        user?.rooms.push(parsedData.roomId)
        
    }

    if(parsedData.type === "leave_room"){
      const user = Users.find((user)=> user.ws=== ws)
      if(!user){
        return
      }
      user.rooms= user.rooms.filter((roomId)=> roomId !== parsedData.roomId)
    }
    
    if(parsedData.type === "chat"){
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      Users.forEach(user => {
        if(user.rooms.includes(roomId)){
          user.ws.send(JSON.stringify({
            type:"chat",
            message:message,
            roomId

          })
        )
      }})
    }

    
 
  
  
  })

  
  
  });
