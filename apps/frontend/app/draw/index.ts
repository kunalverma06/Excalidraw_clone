
import { Shapes } from "lucide-react";
import { act, RefObject, useRef } from "react";
import axios from "axios";
import {JWT_SECRET} from "@repo/backend-common"
import { HttpBackend } from "./config";
import {shapeSchema} from "@repo/zod-types"
import { json } from "stream/consumers";

// creating the type shape
type Shapes =
    | {
        type: "rect";
        x: number;
        y: number;
        width: number;
        height: number;
    }
    | {
        type: "circle";
        centerX: number;
        centerY: number;
        radius: number;
    } |
    {
        type: "triangle";
        topX: number;
        topY: number;
        leftX: number;
        leftY: number;
        rightX: number;
        rightY: number;
    } | {
        type: "arrow";
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        leftX: number;
        leftY: number;
        rightX: number;
        rightY: number;
    } |
    {
        type: "text";
        x: number;
        y: number;
        value: string
    } |
    {
        type: "line";
        x1: number;
        y1: number;
        x2: number;
        y2: number;

    }

interface Select {
    x: number,
    y: number,
    width: number,
    height: number
}


// create an object for the existing shapes
let Existing_Shapes:Shapes[] = [];
const Selected_Shapes: Shapes[] = []; // creatd an object for the selected shape 
let Select_Rect: Select = { x: 0, y: 0, width: 0, height: 0 }; // create an object which will take rect args to see move the shapes


async function  initdraw(
    canvas: HTMLCanvasElement,
    startRef: RefObject<{ x: number; y: number }>,
    currentRef: RefObject<{ x: number; y: number }>,
    activeTool: RefObject<string>,
    roomId:string,
    socket:WebSocket
) {
    Existing_Shapes = await getExistingShapes(roomId);
    console.log(activeTool.current)
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }

     socket.onmessage=(event)=>{
        const message = JSON.parse(event.data);

        if(message.type==="draw"){
            const parsedShape = JSON.parse(message.message)
            Existing_Shapes.push(parsedShape)
            ctx.clearRect(0, 0, canvas.width, canvas.height);``
            
        }
    }

    let clicked = false;

    const handleMouseDown = (e: MouseEvent) => {
        if (activeTool.current === "eraser") {
            eraseAt(e, ctx);
        }
        clicked = true;

        startRef.current = { x: e.clientX, y: e.clientY };
        console.log("starting", startRef.current);
    };

    const handleMouseUp = () => {
        clicked = false;
        const { startX, startY } = { startX: startRef.current.x, startY: startRef.current.y }
        const { endX, endY } = { endX: currentRef.current.x, endY: currentRef.current.y }
        const shape = CreateShape({ x: startX, y: startY }, { x: endX, y: endY }, activeTool, ctx);

        if (shape) {
            Addshapes(shape);
        }
        
        
        
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (clicked && activeTool.current === "eraser") {
            eraseAt(e, ctx);
            return;

        }
        if (clicked) {
            currentRef.current = { x: e.clientX, y: e.clientY };

            const { x: current_x, y: current_y } = currentRef.current!;
            const { x, y } = startRef.current!;


            const { width, height } = canvas

            // redraw all saved shapes
            Existing_Draw(ctx, { width, height })
            // draw the preview rect

            CreateShape({ x: x, y: y }, { x: current_x, y: current_y }, activeTool, ctx)

            


        }

         if (activeTool.current === "select") {
            SelectShape(ctx);
            Moveshape(e , ctx )
        }

    };


    const SelectShape = (ctx: CanvasRenderingContext2D) => {
        const x = Select_Rect.x;
        const y = Select_Rect.y;
        const width = Select_Rect.width;
        const height = Select_Rect.height;

        Selected_Shapes.length = 0; // clear previous selection
        for (let i = Existing_Shapes.length - 1; i >= 0; i--) {
            const shape = Existing_Shapes[i];
            if (isPointInsideShape(x, y, width, height, shape)) {
                if (!Selected_Shapes.includes(shape)) {
                    Selected_Shapes.push(shape)
                }

            }
        }
        


    }

    function isPointInsideShape(x: number, y: number, width: number, height: number, shape: Shapes): boolean {
        // Rectangle selection logic: check if the shape's bounding box is fully inside the selection rectangle
        if (shape.type === "rect") {
            return (
                shape.x >= x &&
                shape.y >= y &&
                shape.x + shape.width <= x + width &&
                shape.y + shape.height <= y + height
            );
        }
        if (shape.type === "circle") {
            return (
                shape.centerX - shape.radius >= x &&
                shape.centerY - shape.radius >= y &&
                shape.centerX + shape.radius <= x + width &&
                shape.centerY + shape.radius <= y + height
            );
        }
        if (shape.type === "triangle") {
            const minX = Math.min(shape.topX, shape.leftX, shape.rightX);
            const maxX = Math.max(shape.topX, shape.leftX, shape.rightX);
            const minY = Math.min(shape.topY, shape.leftY, shape.rightY);
            const maxY = Math.max(shape.topY, shape.leftY, shape.rightY);
            return (
                minX >= x &&
                minY >= y &&
                maxX <= x + width &&
                maxY <= y + height
            );
        }
        if (shape.type === "arrow" || shape.type === "line") {
            const minX = Math.min(shape.x1, shape.x2);
            const maxX = Math.max(shape.x1, shape.x2);
            const minY = Math.min(shape.y1, shape.y2);
            const maxY = Math.max(shape.y1, shape.y2);
            return (
                minX >= x &&
                minY >= y &&
                maxX <= x + width &&
                maxY <= y + height
            );
        }
        if (shape.type === "text") {
            const fontSize = 16;
            const textWidth = shape.value.length * fontSize * 0.6;
            const textHeight = fontSize;
            return (
                shape.x >= x &&
                shape.y - textHeight >= y &&
                shape.x + textWidth <= x + width &&
                shape.y <= y + height
            );
        }
        return false;
    }


    function Moveshape(e: MouseEvent ,ctx:CanvasRenderingContext2D) {
        const dx = e.movementX
        const dy = e.movementY

        for (const shape of Selected_Shapes) {
            switch (shape.type) {
                case "rect":
                    shape.x += dx;
                    shape.y += dy;
                    break;
                case "circle":
                    shape.centerX += dx;
                    shape.centerY += dy;
                    break;
                case "triangle":
                    shape.topX += dx; shape.topY += dy;
                    shape.leftX += dx; shape.leftY += dy;
                    shape.rightX += dx; shape.rightY += dy;
                    break;
                case "line":
                case "arrow":
                    shape.x1 += dx; shape.y1 += dy;
                    shape.x2 += dx; shape.y2 += dy;
                    if (shape.type === "arrow") {
                        shape.leftX += dx; shape.leftY += dy;
                        shape.rightX += dx; shape.rightY += dy;
                    }
                    break;
                case "text":
                    shape.x += dx;
                    shape.y += dy;
                    break;
            }
        }
        Existing_Draw(ctx, { width: canvas.width, height: canvas.height });
        return

    }


    function eraseAt(e: MouseEvent, ctx: CanvasRenderingContext2D) {
        const x = e.offsetX;
        const y = e.offsetY;

        // loop backward so removal doesn’t break index order
        for (let i = Existing_Shapes.length - 1; i >= 0; i--) {
            const shape = Existing_Shapes[i];
            if (isPointOnShape(x, y, shape)) {
                Existing_Shapes.splice(i, 1); // remove shape
            }
        }
        Existing_Draw(ctx, { width: canvas.width, height: canvas.height });
    }



    const handleText = (e: KeyboardEvent) => {
        if (activeTool.current === "text") {
            const lastShape = Existing_Shapes[Existing_Shapes.length - 1];
            if (lastShape?.type === "text") {

                if (lastShape.value === "write") {
                    console.log("inside");
                    lastShape.value = e.key
                }

                else if (e.key === "Backspace") {
                    lastShape.value = lastShape.value.slice(0, -1)
                }
                else if (e.key.length === 1) {

                    lastShape.value += e.key;
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                Existing_Draw(ctx, { width: canvas.width, height: canvas.height });
            }
        }
    };




    function isPointOnShape(x: number, y: number, shape: Shapes): boolean {
        const tolerance = 5; // small buffer around the stroke for realistic erasing

        // --- Rectangle ---
        if (shape.type === "rect") {
            const left = shape.x;
            const right = shape.x + shape.width;
            const top = shape.y;
            const bottom = shape.y + shape.height;

            const nearLeft = Math.abs(x - left) <= tolerance && y >= top && y <= bottom;
            const nearRight = Math.abs(x - right) <= tolerance && y >= top && y <= bottom;
            const nearTop = Math.abs(y - top) <= tolerance && x >= left && x <= right;
            const nearBottom = Math.abs(y - bottom) <= tolerance && x >= left && x <= right;

            return nearLeft || nearRight || nearTop || nearBottom;
        }

        // --- Circle ---
        if (shape.type === "circle") {
            const dx = x - shape.centerX;
            const dy = y - shape.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            // Near the circle edge (radius ± tolerance)
            return Math.abs(distance - shape.radius) <= tolerance;
        }

        // --- Triangle ---
        if (shape.type === "triangle") {
            const { topX, topY, leftX, leftY, rightX, rightY } = shape;
            const d1 = pointToLineDistance(x, y, { x1: topX, y1: topY, x2: leftX, y2: leftY });
            const d2 = pointToLineDistance(x, y, { x1: leftX, y1: leftY, x2: rightX, y2: rightY });
            const d3 = pointToLineDistance(x, y, { x1: rightX, y1: rightY, x2: topX, y2: topY });
            // Cursor near any triangle side = “touching stroke”
            return d1 <= tolerance || d2 <= tolerance || d3 <= tolerance;
        }

        // --- Line / Arrow ---
        if (shape.type === "line" || shape.type === "arrow") {
            const distance = pointToLineDistance(x, y, shape);
            return distance <= tolerance;
        }

        // --- Text ---
        if (shape.type === "text") {
            const fontSize = 16;
            const textWidth = shape.value.length * fontSize * 0.6;
            const textHeight = fontSize;
            const left = shape.x;
            const right = shape.x + textWidth;
            const top = shape.y - textHeight;
            const bottom = shape.y;

            const nearLeft = Math.abs(x - left) <= tolerance && y >= top && y <= bottom;
            const nearRight = Math.abs(x - right) <= tolerance && y >= top && y <= bottom;
            const nearTop = Math.abs(y - top) <= tolerance && x >= left && x <= right;
            const nearBottom = Math.abs(y - bottom) <= tolerance && x >= left && x <= right;

            return nearLeft || nearRight || nearTop || nearBottom;
        }

        return false;
    }






    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("keydown", (e) => handleText(e))

}

export default initdraw;

function Addshapes(shape: Shapes) {
    Existing_Shapes.push(shape);
    console.log(shape);
}


function Existing_Draw(ctx: CanvasRenderingContext2D, canvas: { width: number, height: number }) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Existing_Shapes.forEach((shape) => {
        if (shape.type === "rect") {

            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
        }
        if (shape.type === "circle") {
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (shape.type === "triangle") {
            ctx.beginPath();
            ctx.moveTo(shape.topX, shape.topY);       // top vertex
            ctx.lineTo(shape.leftX, shape.leftY);     // left vertex
            ctx.lineTo(shape.rightX, shape.rightY);   // right vertex
            ctx.closePath();                          // closes back to top
            ctx.stroke();
        }

        if (shape.type === "arrow") {
            ctx.beginPath();
            ctx.moveTo(shape.x1, shape.y1);
            ctx.lineTo(shape.x2, shape.y2);
            ctx.moveTo(shape.x2, shape.y2);
            ctx.lineTo(shape.leftX, shape.leftY);
            ctx.moveTo(shape.x2, shape.y2);
            ctx.lineTo(shape.rightX, shape.rightY);
            ctx.stroke();
        }
        if (shape.type === "text") {
            ctx.font = "16px Arial";
            ctx.fillText(shape.value, shape.x, shape.y);
        }

        if (shape.type === "line") {
            ctx.beginPath();
            ctx.moveTo(shape.x1, shape.y1);
            ctx.lineTo(shape.x2, shape.y2);
            ctx.stroke();
        }



    })
}


function CreateShape(
    start: { x: number; y: number },
    end: { x: number; y: number },
    activeTool: RefObject<string>,
    ctx: CanvasRenderingContext2D
): Shapes | undefined {
    const startX = start.x;
    const startY = start.y;
    const endX = end.x;
    const endY = end.y;


    if (activeTool.current === "select") {

        const shape = { type: "select", x: startX, y: startY, width: endX - startX, height: endY - startY }
        ctx.fillStyle = "rgba(200, 180, 255, 0.2)"; // pastel lavender
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        // Select_Rect.x = shape.x;
        // Select_Rect.y = shape.y;
        // Select_Rect.width = shape.width;
        // Select_Rect.height = shape.height;
         Object.assign(Select_Rect, shape);  // the above commented code is same as this line 

    }



    else if (activeTool.current === "rectangle") {

        const shape: Shapes = { type: "rect", x: startX, y: startY, width: endX - startX, height: endY - startY };
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        return shape;
    }

    else if (activeTool.current === "circle") {
        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) / 2;
        const shape: Shapes = { type: "circle", centerX, centerY, radius };

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        return shape;
    }

    else if (activeTool.current === "triangle") {
        const topX = (startX + endX) / 2;
        const topY = startY;
        const leftX = startX;
        const leftY = endY;
        const rightX = endX;
        const rightY = endY;

        const shape: Shapes = { type: "triangle", topX, topY, leftX, leftY, rightX, rightY };

        ctx.beginPath();
        ctx.moveTo(topX, topY);
        ctx.lineTo(leftX, leftY);
        ctx.lineTo(rightX, rightY);
        ctx.closePath();
        ctx.stroke();
        return shape;
    }

    else if (activeTool.current === "arrow") {
        const x1 = startX;
        const y1 = startY;
        const x2 = endX;
        const y2 = endY;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 10;
        const leftX = x2 - headLen * Math.cos(angle - Math.PI / 6);
        const leftY = y2 - headLen * Math.sin(angle - Math.PI / 6);
        const rightX = x2 - headLen * Math.cos(angle + Math.PI / 6);
        const rightY = y2 - headLen * Math.sin(angle + Math.PI / 6);

        const shape: Shapes = { type: "arrow", x1, y1, x2, y2, leftX, leftY, rightX, rightY };

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.moveTo(x2, y2);
        ctx.lineTo(leftX, leftY);
        ctx.moveTo(x2, y2);
        ctx.lineTo(rightX, rightY);
        ctx.stroke();

        return shape;
    }

    else if (activeTool.current === "text") {
        const shape: Shapes = { type: "text", x: startX, y: startY, value: "write" };
        ctx.font = "20px Arial";  // default font
        ctx.fillText(shape.value, shape.x, shape.y);
        return shape;
    }

    else if (activeTool.current === "line") {
        const x1 = startX;
        const y1 = startY;
        const x2 = endX;
        const y2 = endY;
        const shape: Shapes = { type: "line", x1, y1, x2, y2 }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.stroke();
        ctx.closePath();
        return shape;
    }
}


function pointToLineDistance(
    x: number,
    y: number,
    line: { x1: number; y1: number; x2: number; y2: number }
) {
    const A = x - line.x1;
    const B = y - line.y1;
    const C = line.x2 - line.x1;
    const D = line.y2 - line.y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = len_sq !== 0 ? dot / len_sq : -1;

    let xx, yy;
    if (param < 0) { xx = line.x1; yy = line.y1; }
    else if (param > 1) { xx = line.x2; yy = line.y2; }
    else { xx = line.x1 + param * C; yy = line.y1 + param * D; }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

async function getExistingShapes(roomId: string): Promise<Shapes[]> {
   try{ const res = await axios.get(`${HttpBackend}/elements/${roomId}`);
   
    const shapes =res.data.drawings;

    const Existing_Shapes = shapes.map((x:{shapes:string})=>{
        const  shapesData = JSON.parse(x.shapes)
        const Data = shapeSchema.safeParse(shapesData)
        if (Data.success) {
                return Data.data;
            }
            console.warn("Invalid shape data:", shapesData);
            return null; // skip invalid shape
    })
    return Existing_Shapes
}catch(err){
    console.log("Failed to fetch shapes",err)
    return [];
}

}