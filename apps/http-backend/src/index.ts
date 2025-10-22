import express from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common";
import { middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SigninSchema } from "@repo/zod-types"
import { prisma } from "@repo/db"
import { hash, compare } from "bcrypt";
import { PrismaClient } from "../../../packages/db/generated/prisma";
import cors from "cors"
import cookieParser from "cookie-parser";


const app = express();
const PORT = 9000;
app.use(express.json());
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:3001", // frontend URL
  credentials: true, // if you send cookies or authorization headers
}
));





// simple health check endpoint
app.post("/signup", async (req, res) => {
  console.log("signup endpoint hit");
  const values = CreateUserSchema.safeParse(req.body); //get the inputs from the frontend 
  if (!values.success) {
    return res.json({
      message: values.error.issues
    })
  }
  const saltCode = 10;
  const hashedPassword = await hash(values.data.password, saltCode);

  try {
    const user_value = await prisma.user.create({ //creating the user using prisma

      data: {
        email: values.data.email,

        password: hashedPassword,

        username: values.data.username,

        name: values.data.name
      }
    })
    const userId = user_value.id;

    res.json({
      userId: userId
    })
  }
  catch (e) {
    return res.json({
      message: "email already exists"
    })
  }

});

app.post("/signin", async (req, res) => {


  const value = SigninSchema.safeParse(req.body);

  if (!value.success) {
    return res.json({
      message: "invalid inputs"
    })
  }
  const email = value.data.email;
  const password = value.data.password;

  //finding the user with the given email
  try {
    const user_value = await prisma.user.findUnique({
      where: {
        email: email as unknown as string
      }
    })
    if (!user_value) {
      return res.json({
        message: "user not found"
      })
    }
    const userId = user_value.id;

    // comparing password usign bcrypt compare function
    const isPasswordValid = await compare(password, user_value.password);
    if (!isPasswordValid) {
      return res.json({
        message: "invalid password"
      })
    }

    const token = jwt.sign(userId, JWT_SECRET);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,

    })
    res.json({
      message: "Signed in successfully",
      userId: userId,
      token:token
    })

  } catch (e) {
    return res.json({
      message: "something went wrong"
    })
  }



})

interface CustomReq extends express.Request {
  userId?: string;
}

app.post("/create-room", middleware, async (req: CustomReq, res) => {
  try{const value = CreateRoomSchema.safeParse(req.body)
  if (!value.success) {
    return res.json({
      message: "Invalid Inputs"
    })
  }
  const adminId = req.userId;
  console.log("user id is ",adminId)
  if (!adminId) {
    return res.json({
      message: "Userid is missing"
    })
  }
  
    const room_value = await prisma.room.create({
      data: {
        adminId: adminId,
        roomName: value.data.roomName
      }

    })
    const roomId = room_value.id;
    const roomName = room_value.roomName;
    const createdAt = room_value.createdAt;
    return res.json({
      roomId:roomId,
      roomName:roomName,
      createdAt:createdAt
    })

  }

  catch (e) {
    return res.json({
      message: "Room with same name already exists"
    })
  }


})

app.get("/elements/:roomId", (req, res) => {
  const roomId = req.params.roomId;
  const drawings = prisma.drawing.findMany({
    where: { roomId: roomId },
  })

  res.json({
    message:"aagya bhai",
    drawings});
})

app.get("/check-auth",  (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ authenticated: false })
  }
  try {
    const decoded =  jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    return res.json({ authenticated: true, userId: decoded });
  } catch (err) {
    return res.json({ authenticated: false, });
  }
})

app.get("/rooms/:userId", async (req, res) => {
  try {
    const userId = req.params.userId
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const rooms = await prisma.room.findMany({
      where: { adminId: userId },
      orderBy: { createdAt: "desc" }
    },)

    if (!rooms) {
      return res.json({
        message: "no rooms finded "
      })
    }
    return res.status(200).json({
      message: "Rooms fetched successfully",
      rooms,
    })
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });


  }
})





app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
