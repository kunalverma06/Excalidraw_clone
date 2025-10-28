"use client"
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import CanvasComp from "@/components/RoomCanvas";
import RoomCanvas from "@/components/RoomCanvas";
import { useState } from "react";

export  const Canvas = ({roomId}:{roomId:string})=>{
    
    const activeTool = useRef("select")
     const [darkMode, setDarkMode] = useState(false);
     console.log(darkMode);
    console.log("ehhe",roomId);

        return (
        <div >
            <Navbar activeTool={activeTool} darkMode={darkMode} setDarkMode={setDarkMode} />
            <RoomCanvas activeTool={activeTool} roomId={roomId} darkMode={darkMode}  />
        </div>
    );
    
}