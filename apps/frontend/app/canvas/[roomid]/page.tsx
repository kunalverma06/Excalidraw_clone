"use client";
import { use, useEffect, useRef, useState } from "react";

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const startRef = useRef({ x: 0, y: 0 }); // use:store the intital values of x and y of shape
    const rectRef = useRef({x:0 , y:0}) // use:store the current state of x and y 


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            console.log("hello")
            return;
        }

        let  clicked = false;
        const handleMouseDown = (e:MouseEvent) => {
            clicked=true
            startRef.current = ({ x: e.clientX, y: e.clientY });
        }


        const handleMouseUp = () => {
            clicked=false   
        };

        const handleMouseMove=(e:MouseEvent)=>{
            
            if(clicked){
                //accessing the current value while mouse move 
                rectRef.current =({x: e.clientX, y: e.clientY })

                //retrieved the value of x and y  and named them xval and y val
                const {x:current_x,y:current_y} = rectRef.current 

                const {x,y} = startRef.current
                const width = current_x - x; // current value of x and inital value of x gives width 

                const height = current_y -y ; // gives height
                
                ctx.clearRect(0,0,canvas.width,canvas.height)
                ctx.strokeRect(x,y,width,height);
            }
            
            
        }

    

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mouseup", handleMouseUp);
        canvas.addEventListener("mousemove",handleMouseMove);


    }, [canvasRef]);

    return (
        <div >
            <canvas
                ref={canvasRef}
                width={10000}
                height={10000}
                style={{backgroundColor:"pink"}}
            ></canvas>

        </div>
    );
}
