"use client"
import { useEffect ,useRef} from "react";
import initdraw from "@/app/draw";


interface Canvaselem{
    roomId :string,
    activeTool:React.RefObject<string>,
    socket : WebSocket
}
export const CanvasComp =({roomId,activeTool,socket}:Canvaselem)=>{

    const canvasRef = useRef<HTMLCanvasElement>(null);
        const startRef = useRef({ x: 0, y: 0 }); // use:store the intital values of x and y of shape
        const currentRef = useRef({ x: 0, y: 0 }) // use:store the current state of x and y 
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        initdraw(canvas, currentRef, startRef ,activeTool,roomId,socket)
        
    })
      const w = window.innerWidth;
    const h = window.innerHeight

    return(
        <div>
            <canvas className="z-0"
                ref={canvasRef}
                width={w}
                height={h}
                style={{ backgroundColor: "pink" }}
            ></canvas>
        </div>

    )
}