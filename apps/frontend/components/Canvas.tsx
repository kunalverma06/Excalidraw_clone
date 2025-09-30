"use client"
import { useEffect, useRef } from "react";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("Context not found");
      return;
    }

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw red rectangle
    ctx.fillStyle = "red";
    ctx.fillRect(10, 20, 50, 50);
    
    // Draw a blue rectangle to test
    ctx.fillStyle = "blue";
    ctx.fillRect(100, 100, 80, 80);
    
    // Draw a green circle
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(250, 250, 40, 0, Math.PI * 2);
    ctx.fill();
    
    console.log("Drawing complete");
  }, []);

  return (
    <div style={{ padding: "20px", backgroundColor: "#f0f0f0" }}>
      <h2 style={{ marginBottom: "10px" }}>Canvas Test</h2>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={{ 
          border: "2px solid black",
          display: "block",
          backgroundColor: "white"
        }}
      />
    </div>
  );
}