import WebSocket from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";
import { prisma } from "@repo/db";

const port = 8080;
const wss = new WebSocket.Server({ port });

interface User {
  ws: WebSocket;
  rooms: string[];
  Userid: string;
}

const Users: User[] = [];

function checkAuth(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!decoded || !decoded.Userid) return null;
    return decoded.Userid;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

function safeSend(ws: WebSocket, data: any): void {
  if (ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(data));
    } catch (err) {
      console.error("Send error:", err);
    }
  }
}

wss.on("listening", () => {
  console.log(`✅ WebSocket server running at ws://localhost:${port}`);
});

wss.on("connection", (socket, request) => {
  const url = request.url;
  if (!url) {
    safeSend(socket, { type: "error", message: "Missing URL" });
    socket.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const Userid = checkAuth(token);

  if (!Userid) {
    safeSend(socket, { type: "error", message: "Invalid authentication" });
    socket.close();
    return;
  }

  const user: User = { ws: socket, rooms: [], Userid };
  Users.push(user);
  console.log(`User ${Userid} connected. Active users: ${Users.length}`);

  socket.on("message", async (rawData) => {
    try {
      const parsed = JSON.parse(rawData.toString());
      const { type, roomId, message, username } = parsed;

      // ✅ JOIN ROOM
      if (type === "join_room" && roomId) {
        if (!user.rooms.includes(roomId)) user.rooms.push(roomId);
        safeSend(socket, { type: "joined_room", roomId });
        console.log(`${Userid} joined room ${roomId}`);
      }

      // ✅ LEAVE ROOM
      if (type === "leave_room" && roomId) {
        user.rooms = user.rooms.filter((r) => r !== roomId);
        safeSend(socket, { type: "left_room", roomId });
        console.log(`${Userid} left room ${roomId}`);
      }

      // ✅ DRAW EVENT
      if (type === "draw" && roomId && message) {
        await prisma.drawing.create({
          data: { roomId, message, userId: Userid, username },
        });

        Users.forEach((u) => {
          if (u.rooms.includes(roomId)) {
            safeSend(u.ws, { type: "draw", roomId, message });
          }
        });

        console.log(`Draw event in room ${roomId} by ${username}`);
      }
    } catch (err) {
      console.error("Message error:", err);
      safeSend(socket, { type: "error", message: "Invalid message format" });
    }
  });

  socket.on("close", () => {
    const idx = Users.findIndex((u) => u.ws === socket);
    if (idx === -1) {
      return;
    }
    const [removed] = Users.splice(idx, 1);
    if (removed) {
      console.log(`User ${removed.Userid} disconnected`);
    }
  });

  socket.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing WebSocket server...");
  wss.close(() => {
    console.log("WebSocket server closed");
    process.exit(0);
  });
});
