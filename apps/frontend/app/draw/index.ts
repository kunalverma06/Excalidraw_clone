import { RefObject } from "react";
import axios from "axios";
import { HttpBackend } from "./config";
import { shapeSchema } from "@repo/zod-types";

// -----------------------------
// Shape Types
// -----------------------------
export type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; centerX: number; centerY: number; radius: number }
  | { type: "triangle"; topX: number; topY: number; leftX: number; leftY: number; rightX: number; rightY: number }
  | { type: "arrow"; x1: number; y1: number; x2: number; y2: number; leftX: number; leftY: number; rightX: number; rightY: number }
  | { type: "text"; x: number; y: number; value: string }
  | { type: "line"; x1: number; y1: number; x2: number; y2: number };

interface Select {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DrawMessage {
  type: "draw";
  roomId: string;
  username: string;
  message: string;
}

// -----------------------------
// Globals
// -----------------------------
let Existing_Shapes: Shape[] = [];
let Select_Rect: Select = { x: 0, y: 0, width: 0, height: 0 };

// -----------------------------
// Safe WebSocket Sender
// -----------------------------
function safeSend(socket: WebSocket, data: any): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    console.warn("⚠️ Tried to send on a closed WebSocket");
  }
}

// -----------------------------
// Main Draw Initialization
// -----------------------------
export default async function initdraw(
  canvas: HTMLCanvasElement,
  startRef: RefObject<{ x: number; y: number }>,
  currentRef: RefObject<{ x: number; y: number }>,
  activeTool: RefObject<string>,
  roomId: string,
  socket: WebSocket,
  darkMode: boolean
): Promise<void> {
  // Fetch old shapes for this room
  Existing_Shapes = await getExistingShapes(roomId);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Draw previously saved shapes
  Existing_Draw(ctx, { width: canvas.width, height: canvas.height }, darkMode);

  // Handle incoming WebSocket messages
  socket.onmessage = (event: MessageEvent<string>): void => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === "draw" && message.roomId === roomId) {
        const parsedShape: Shape = JSON.parse(message.message);
        Existing_Shapes.push(parsedShape);
        Existing_Draw(ctx, { width: canvas.width, height: canvas.height }, darkMode);
      }
    } catch (err) {
      console.error("Socket message error:", err);
    }
  };

  let clicked = false;

  const handleMouseDown = (e: MouseEvent): void => {
    if (activeTool.current === "eraser") eraseAt(e, ctx);
    clicked = true;
    startRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (): void => {
    clicked = false;
    if (!startRef.current || !currentRef.current) return;

    const { x: startX, y: startY } = startRef.current;
    const { x: endX, y: endY } = currentRef.current;
    const shape = CreateShape({ x: startX, y: startY }, { x: endX, y: endY }, activeTool, ctx, darkMode);

    if (shape) {
      AddShape(shape);
      const message: DrawMessage = {
        type: "draw",
        roomId,
        username: localStorage.getItem("username") || "Anonymous",
        message: JSON.stringify(shape),
      };
      safeSend(socket, message); // ✅ safe send to prevent CLOSING/CLOSED errors
    }
  };

  const handleMouseMove = (e: MouseEvent): void => {
    if (clicked && activeTool.current === "eraser") {
      eraseAt(e, ctx);
      return;
    }

    if (clicked && startRef.current) {
      currentRef.current = { x: e.clientX, y: e.clientY };
      const { x, y } = startRef.current;
      const { x: currentX, y: currentY } = currentRef.current!;
      Existing_Draw(ctx, { width: canvas.width, height: canvas.height }, darkMode);
      CreateShape({ x, y }, { x: currentX, y: currentY }, activeTool, ctx, darkMode);
    }

    if (activeTool.current === "select") {
      SelectShape(ctx);
      MoveShape(e, ctx);
    }
  };

  const handleText = (e: KeyboardEvent): void => {
    if (activeTool.current === "text") {
      const lastShape = Existing_Shapes[Existing_Shapes.length - 1];
      if (lastShape?.type === "text") {
        if (lastShape.value === "write") lastShape.value = e.key;
        else if (e.key === "Backspace") lastShape.value = lastShape.value.slice(0, -1);
        else if (e.key.length === 1) lastShape.value += e.key;

        Existing_Draw(ctx, { width: canvas.width, height: canvas.height }, darkMode);
      }
    }
  };

  // Add Event Listeners
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("keydown", handleText);

  // Handle socket close gracefully
  socket.onclose = () => {
    console.warn("🔌 WebSocket closed.");
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };
}

// -----------------------------
// Utility Functions
// -----------------------------
function AddShape(shape: Shape): void {
  Existing_Shapes.push(shape);
}

export function Existing_Draw(
  ctx: CanvasRenderingContext2D,
  canvas: { width: number; height: number },
  darkMode: boolean
): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = darkMode ? "white" : "black";

  for (const shape of Existing_Shapes) {
    switch (shape.type) {
      case "rect":
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        break;
      case "circle":
        ctx.beginPath();
        ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "triangle":
        ctx.beginPath();
        ctx.moveTo(shape.topX, shape.topY);
        ctx.lineTo(shape.leftX, shape.leftY);
        ctx.lineTo(shape.rightX, shape.rightY);
        ctx.closePath();
        ctx.stroke();
        break;
      case "arrow":
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.moveTo(shape.x2, shape.y2);
        ctx.lineTo(shape.leftX, shape.leftY);
        ctx.moveTo(shape.x2, shape.y2);
        ctx.lineTo(shape.rightX, shape.rightY);
        ctx.stroke();
        break;
      case "text":
        ctx.font = "16px Arial";
        ctx.fillText(shape.value, shape.x, shape.y);
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
        ctx.closePath();
        break;
    }
  }
}

function CreateShape(
  start: { x: number; y: number },
  end: { x: number; y: number },
  activeTool: RefObject<string>,
  ctx: CanvasRenderingContext2D,
  darkMode: boolean
): Shape | undefined {
  const { x: startX, y: startY } = start;
  const { x: endX, y: endY } = end;
  ctx.strokeStyle = darkMode ? "white" : "black";

  switch (activeTool.current) {
    case "rectangle":
      const rect: Shape = { type: "rect", x: startX, y: startY, width: endX - startX, height: endY - startY };
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      return rect;

    case "circle":
      const centerX = (startX + endX) / 2;
      const centerY = (startY + endY) / 2;
      const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      return { type: "circle", centerX, centerY, radius };

    case "line":
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      return { type: "line", x1: startX, y1: startY, x2: endX, y2: endY };

    case "text":
      const text: Shape = { type: "text", x: startX, y: startY, value: "write" };
      ctx.font = "16px Arial";
      ctx.fillText(text.value, text.x, text.y);
      return text;

    case "arrow":
      const angle = Math.atan2(endY - startY, endX - startX);
      const headLen = 10;
      const leftX = endX - headLen * Math.cos(angle - Math.PI / 6);
      const leftY = endY - headLen * Math.sin(angle - Math.PI / 6);
      const rightX = endX - headLen * Math.cos(angle + Math.PI / 6);
      const rightY = endY - headLen * Math.sin(angle + Math.PI / 6);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.moveTo(endX, endY);
      ctx.lineTo(leftX, leftY);
      ctx.moveTo(endX, endY);
      ctx.lineTo(rightX, rightY);
      ctx.stroke();
      return { type: "arrow", x1: startX, y1: startY, x2: endX, y2: endY, leftX, leftY, rightX, rightY };

    default:
      return undefined;
  }
}

// -----------------------------
// Fetch existing shapes
// -----------------------------
async function getExistingShapes(roomId: string): Promise<Shape[]> {
  try {
    const res = await axios.get(`${HttpBackend}/elements/${roomId}`);
    const shapes = res.data.drawings;

    const parsedShapes: Shape[] = shapes
      .map((item: { shapes: string }) => {
        try {
          const shapeData = JSON.parse(item.shapes);
          const parsed = shapeSchema.safeParse(shapeData);
          return parsed.success ? parsed.data : null;
        } catch {
          return null;
        }
      })
      .filter((s): s is Shape => s !== null);

    return parsedShapes;
  } catch (err) {
    console.error("Failed to fetch shapes:", err);
    return [];
  }
}

// -----------------------------
// Placeholder Functions
// -----------------------------
function eraseAt(e: MouseEvent, ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(e.clientX - 5, e.clientY - 5, 10, 10);
}

function SelectShape(_ctx: CanvasRenderingContext2D): void {
  // Placeholder for selection logic
}

function MoveShape(_e: MouseEvent, _ctx: CanvasRenderingContext2D): void {
  // Placeholder for movement logic
}
