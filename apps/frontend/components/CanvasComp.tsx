"use client"
import { useEffect, useRef } from "react";
import initdraw , { Existing_Draw } from "@/app/draw";


interface Canvaselem {
    roomId: string,
    activeTool: React.RefObject<string>,
    socket: WebSocket,
    darkMode: boolean

}
export const CanvasComp = ({ roomId, activeTool, socket, darkMode }: Canvaselem) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const startRef = useRef({ x: 0, y: 0 }); // use:store the intital values of x and y of shape
    const currentRef = useRef({ x: 0, y: 0 }) // use:store the current state of x and y 
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        initdraw(canvas, currentRef, startRef, activeTool, roomId, socket, darkMode)

    })
    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        Existing_Draw(ctx, { width: canvasRef.current.width, height: canvasRef.current.height }, darkMode);
    }, [darkMode]);





    const w = window.innerWidth;
    const h = window.innerHeight

    return (
        <div>
            <canvas className={`z-0  ${darkMode ? "bg-black" : "bg-white"}`}
                ref={canvasRef}
                width={w}
                height={h}

            ></canvas>
        </div>

    )
}