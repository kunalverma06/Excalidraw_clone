import {email, z} from "zod";

export const CreateUserSchema = z.object({
    username: z.string().min(2),
    password: z.string().min(6),
    name: z.string(),
    email: z.email()

});

export const SigninSchema = z.object({
    email: z.email(),
    password: z.string()
})


export const CreateRoomSchema = z.object({
    roomName:z.string().min(3).max(20),
    
})

export const shapeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("rect"),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  z.object({
    type: z.literal("circle"),
    centerX: z.number(),
    centerY: z.number(),
    radius: z.number(),
  }),
  z.object({
    type: z.literal("triangle"),
    topX: z.number(),
    topY: z.number(),
    leftX: z.number(),
    leftY: z.number(),
    rightX: z.number(),
    rightY: z.number(),
  }),
  z.object({
    type: z.literal("arrow"),
    x1: z.number(),
    y1: z.number(),
    x2: z.number(),
    y2: z.number(),
    leftX: z.number(),
    leftY: z.number(),
    rightX: z.number(),
    rightY: z.number(),
  }),
  z.object({
    type: z.literal("line"),
    x1: z.number(),
    y1: z.number(),
    x2: z.number(),
    y2: z.number(),
  }),
  z.object({
    type: z.literal("text"),
    x: z.number(),
    y: z.number(),
    value: z.string().max(200), // optional safety
  }),
]);