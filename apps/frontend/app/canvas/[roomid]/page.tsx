"use client";
import Navbar from "@/components/Navbar";
import CanvasComp from "@/components/Canvas";
import { use, useEffect, useRef, useState } from "react";





export default function Canvas() {
    
   const activeTool = useRef("select")
        return (
        <div >
            <Navbar activeTool={activeTool} />
            <CanvasComp activeTool={activeTool} />
        </div>
    );
}
