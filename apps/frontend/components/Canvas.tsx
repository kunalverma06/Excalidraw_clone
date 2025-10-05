"use client";
import initdraw from "@/app/draw";
import Navbar from "@/components/Navbar";
import { Shapes } from "lucide-react";
import { RefObject, use, useEffect, useRef, useState } from "react";


type CanvasProp = {
  activeTool: React.RefObject<string>;
};

const CanvasComp = ({activeTool}:CanvasProp) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const startRef = useRef({ x: 0, y: 0 }); // use:store the intital values of x and y of shape
    const currentRef = useRef({ x: 0, y: 0 }) // use:store the current state of x and y 

    
   

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        initdraw(canvas, currentRef, startRef ,activeTool)
        
    })
    const w = window.innerWidth;
    const h = window.innerHeight

    return (
        <div >

            <canvas className="z-0"
                ref={canvasRef}
                width={w}
                height={h}
                style={{ backgroundColor: "pink" }}
            ></canvas>

        </div>
    )
}
export default CanvasComp