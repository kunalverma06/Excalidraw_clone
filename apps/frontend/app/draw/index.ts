
import { act, RefObject, useRef } from "react";

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
    }


// create an object for the existing shapes
const Existing_Shapes: Shapes[] = [];


function initdraw(
    canvas: HTMLCanvasElement,
    startRef: RefObject<{ x: number; y: number }>,
    currentRef: RefObject<{ x: number; y: number }>,
    activeTool: RefObject<string>
) {

    console.log(activeTool.current)
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }

    let clicked = false;

    const handleMouseDown = (e: MouseEvent) => {
        clicked = true;
        startRef.current = { x: e.clientX, y: e.clientY };
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
    };


    const handleText=(e:KeyboardEvent) => {
        if (activeTool.current === "text") {
            const lastShape = Existing_Shapes[Existing_Shapes.length - 1];
            if (lastShape?.type === "text") {
                
                if ( lastShape.value==="write"  ) {
                    console.log("inside");
                    lastShape.value= e.key}
            
                else if(e.key==="Backspace"){
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


    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("keydown",(e)=>handleText(e) )

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


    if (activeTool.current === "rectangle") {

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
        ctx.font = "16px Arial";  // default font
        ctx.fillText(shape.value, shape.x, shape.y);
        return shape;
    }
}
