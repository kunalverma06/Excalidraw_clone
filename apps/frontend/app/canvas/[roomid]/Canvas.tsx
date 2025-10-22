"use client"
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import CanvasComp from "@/components/RoomCanvas";
import RoomCanvas from "@/components/RoomCanvas";

export  const Canvas = ({roomId}:{roomId:string})=>{
    
    const activeTool = useRef("select")
    console.log("ehhe",roomId);

        return (
        <div >
            <Navbar activeTool={activeTool} />
            <RoomCanvas activeTool={activeTool} roomId={roomId} />
        </div>
    );
    
}