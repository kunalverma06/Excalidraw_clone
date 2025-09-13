import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common";
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws,request) => {
  console.log("✅ New client connected");

  const url= request.url
  if(!url){
    return
  }
  const queryparam = new URLSearchParams(url.split("?")[1]);
  const token = queryparam.get("token")||"";

  const decoded = jwt.verify(token,JWT_SECRET)

  if(!decoded || !(decoded as JwtPayload).email){
    ws.close();
    return;
  }

  ws.on("message", (message) => {
    console.log("📩 Message received from client:", message.toString());

    // optional: reply back
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });
});

console.log("🚀 WebSocket server running on ws://localhost:8080");
