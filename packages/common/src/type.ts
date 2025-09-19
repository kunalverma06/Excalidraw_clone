import {z} from "zod";

export const CreateUserSchema = z.object({
    username: z.string().min(2),
    password: z.string().min(6),
    name: z.string(),
    email: z.string().email()

});

export const SigninSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string()
})


export const CreateRoomSchema = z.object({
    roomName:z.string().min(3).max(20),
    
})