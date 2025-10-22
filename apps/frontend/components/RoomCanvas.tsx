"use client";
import initdraw from "@/app/draw";
import Navbar from "@/components/Navbar";
import { Shapes } from "lucide-react";
import { RefObject, use, useEffect, useRef, useState } from "react";
import { WS_URL } from "@/app/draw/config";
import { CanvasComp } from "./CanvasComp";
import { useRouter } from "next/navigation";

type CanvasProp = {
    activeTool: React.RefObject<string>;
    roomId: string;
};

const RoomCanvas = ({ activeTool, roomId }: CanvasProp) => {
    const startRef = useRef({ x: 0, y: 0 }); // use:store the intital values of x and y of shape
    const currentRef = useRef({ x: 0, y: 0 }) // use:store the current state of x and y 
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const router = useRouter();
    const [token, setToken] = useState<string>();


    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            // No token → redirect to login
            router.push('/authpage');
            return;
        }
        setToken(token);
        
    })

    useEffect(() => {
        if(!token){
            return ;
        }
        const ws = new WebSocket(`${WS_URL}?token=${token}`);
        
        ws.onopen = () => {
            setSocket(ws);
        }

    }, [token])




    if (!socket) {
        return (
            <div>
                Connecting to server
            </div>
        )
    }
    return (
        <div >
            <CanvasComp roomId={roomId} activeTool={activeTool} socket={socket} />


        </div>
    )
}
export default RoomCanvas