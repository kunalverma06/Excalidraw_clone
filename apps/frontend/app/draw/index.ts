import { RefObject } from "react";
import axios from "axios";
import { JWT_SECRET } from "@repo/backend-common";
import { HttpBackend } from "./config";
import { shapeSchema } from "@repo/zod-types";

// -------------------- TYPES --------------------

type Shapes =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; centerX: number; centerY: number; radius: number }
  | {
      type: "triangle";
      topX: number;
      topY: number;
      leftX: number;
      leftY: number;
      rightX: number;
      rightY: number;
    }
  | {
      type: "arrow";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      leftX: number;
      leftY: number;
      rightX: number;
      rightY: number;
    }
  | { type: "text"; x: number; y: number; value: string }
  | { type: "line"; x1: number; y1: number; x2: number; y2: number };

interface Select {
  x: number;
  y: number;
  width: number;
  height: number;
}

// -------------------- GLOBALS --------------------
let Existing_Shapes: Shapes[] = [];
const Selected_Shapes: Shapes[] = [];
let Select_Rect: Select = { x: 0, y: 0, width: 0, height: 0 };

// -------------------- MAIN FUNCTION --------------------

async function initdraw(
  canvas: HTMLCanvasElement,
  startRef: RefObject<{ x: number; y: number }>,
  currentRef: RefObject<{ x: number; y: number }>,
  activeTool: RefObject<string>,
  roomId: string,
  socket: WebSocket,
  darkMode: string
) {
  Existing_Shapes = await getExistingShapes(roomId);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Handle incoming draw events
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "draw") {
      const parsedShape = JSON.parse(message.message);
      Existing_Shapes.push(parsedShape);
      Existing_Draw(ctx, canvas, darkMode);
    }
  };

  let clicked = false;

  const handleMouseDown = (e: MouseEvent) => {
    if (activeTool.current === "eraser") eraseAt(e, ctx, canvas, darkMode);
    clicked = true;
    startRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    clicked = false;
    const startX = startRef.current?.x ?? 0;
    const startY = startRef.current?.y ?? 0;
    const endX = currentRef.current?.x ?? 0;
    const endY = currentRef.current?.y ?? 0;

    const shape = CreateShape({ x: startX, y: startY }, { x: endX, y: endY }, activeTool, ctx);
    if (shape) Addshapes(shape);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (clicked && activeTool.current === "eraser") {
      eraseAt(e, ctx, canvas, darkMode);
      return;
    }

    if (clicked) {
      currentRef.current = { x: e.clientX, y: e.clientY };
      Existing_Draw(ctx, canvas, darkMode);

      const start = startRef.current!;
      const end = currentRef.current!;
      CreateShape(start, end, activeTool, ctx);
    }

    if (activeTool.current === "select") {
      SelectShape(ctx);
      Moveshape(e, ctx, darkMode);
    }
  };

  const handleText = (e: KeyboardEvent) => {
    if (activeTool.current === "text") {
      const lastShape = Existing_Shapes[Existing_Shapes.length - 1];
      if (lastShape?.type === "text") {
        if (lastShape.value === "write") lastShape.value = e.key;
        else if (e.key === "Backspace") lastShape.value = lastShape.value.slice(0, -1);
        else if (e.key.length === 1) lastShape.value += e.key;
        Existing_Draw(ctx, canvas, darkMode);
      }
    }
  };

  // -------------------- EVENT LISTENERS --------------------
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("keydown", handleText);
}

// -------------------- SHAPE HELPERS --------------------

function Addshapes(shape: Shapes) {
  Existing_Shapes.push(shape);
}

export function Existing_Draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, darkMode: string) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = darkMode ? "white" : "black";
  ctx.fillStyle = darkMode ? "white" : "black";

  Existing_Shapes.forEach((shape) => {
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
        ctx.lineTo(shape.leftX, shape.leftY);
        ctx.moveTo(shape.x2, shape.y2);
        ctx.lineTo(shape.rightX, shape.rightY);
        ctx.stroke();
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
        break;
      case "text":
        ctx.font = "16px Arial";
        ctx.fillText(shape.value, shape.x, shape.y);
        break;
    }
  });
}

// -------------------- ERASE --------------------

function eraseAt(e: MouseEvent, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, darkMode: string) {
  const x = e.offsetX;
  const y = e.offsetY;

  for (let i = Existing_Shapes.length - 1; i >= 0; i--) {
    const shape = Existing_Shapes[i];
    if (isPointOnShape(x, y, shape)) Existing_Shapes.splice(i, 1);
  }

  Existing_Draw(ctx, canvas, darkMode);
}

// -------------------- UTILITIES --------------------

function isPointOnShape(x: number, y: number, shape: Shapes): boolean {
  const tolerance = 5;
  if (shape.type === "rect") {
    const left = shape.x;
    const right = shape.x + shape.width;
    const top = shape.y;
    const bottom = shape.y + shape.height;
    return (
      Math.abs(x - left) <= tolerance ||
      Math.abs(x - right) <= tolerance ||
      Math.abs(y - top) <= tolerance ||
      Math.abs(y - bottom) <= tolerance
    );
  }

  if (shape.type === "circle") {
    const dx = x - shape.centerX;
    const dy = y - shape.centerY;
    return Math.abs(Math.sqrt(dx * dx + dy * dy) - shape.radius) <= tolerance;
  }

  if (shape.type === "line" || shape.type === "arrow") {
    return pointToLineDistance(x, y, shape) <= tolerance;
  }

  return false;
}

function Moveshape(e: MouseEvent, ctx: CanvasRenderingContext2D, darkMode: string) {
  const dx = e.movementX;
  const dy = e.movementY;
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
        shape.topX += dx;
        shape.topY += dy;
        shape.leftX += dx;
        shape.leftY += dy;
        shape.rightX += dx;
        shape.rightY += dy;
        break;
      case "arrow":
      case "line":
        shape.x1 += dx;
        shape.y1 += dy;
        shape.x2 += dx;
        shape.y2 += dy;
        if (shape.type === "arrow") {
          shape.leftX += dx;
          shape.leftY += dy;
          shape.rightX += dx;
          shape.rightY += dy;
        }
        break;
      case "text":
        shape.x += dx;
        shape.y += dy;
        break;
    }
  }
  Existing_Draw(ctx, ctx.canvas, darkMode);
}

function CreateShape(
  start: { x: number; y: number },
  end: { x: number; y: number },
  activeTool: RefObject<string>,
  ctx: CanvasRenderingContext2D
): Shapes | undefined {
  const startX = start.x,
    startY = start.y,
    endX = end.x,
    endY = end.y;

  switch (activeTool.current) {
    case "rectangle": {
      const shape: Shapes = { type: "rect", x: startX, y: startY, width: endX - startX, height: endY - startY };
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      return shape;
    }

    case "circle": {
      const centerX = (startX + endX) / 2;
      const centerY = (startY + endY) / 2;
      const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) / 2;
      const shape: Shapes = { type: "circle", centerX, centerY, radius };
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      return shape;
    }

    case "triangle": {
      const shape: Shapes = {
        type: "triangle",
        topX: (startX + endX) / 2,
        topY: startY,
        leftX: startX,
        leftY: endY,
        rightX: endX,
        rightY: endY,
      };
      ctx.beginPath();
      ctx.moveTo(shape.topX, shape.topY);
      ctx.lineTo(shape.leftX, shape.leftY);
      ctx.lineTo(shape.rightX, shape.rightY);
      ctx.closePath();
      ctx.stroke();
      return shape;
    }

    case "line": {
      const shape: Shapes = { type: "line", x1: startX, y1: startY, x2: endX, y2: endY };
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      return shape;
    }

    case "arrow": {
      const angle = Math.atan2(endY - startY, endX - startX);
      const headLen = 10;
      const shape: Shapes = {
        type: "arrow",
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        leftX: endX - headLen * Math.cos(angle - Math.PI / 6),
        leftY: endY - headLen * Math.sin(angle - Math.PI / 6),
        rightX: endX - headLen * Math.cos(angle + Math.PI / 6),
        rightY: endY - headLen * Math.sin(angle + Math.PI / 6),
      };
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.lineTo(shape.leftX, shape.leftY);
      ctx.moveTo(endX, endY);
      ctx.lineTo(shape.rightX, shape.rightY);
      ctx.stroke();
      return shape;
    }

    case "text": {
      const shape: Shapes = { type: "text", x: startX, y: startY, value: "write" };
      ctx.font = "16px Arial";
      ctx.fillText(shape.value, shape.x, shape.y);
      return shape;
    }
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
  const xx = param < 0 ? line.x1 : param > 1 ? line.x2 : line.x1 + param * C;
  const yy = param < 0 ? line.y1 : param > 1 ? line.y2 : line.y1 + param * D;
  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

// -------------------- FETCH EXISTING --------------------

async function getExistingShapes(roomId: string): Promise<Shapes[]> {
  try {
    const res = await axios.get(`${HttpBackend}/elements/${roomId}`);
    const shapes = res.data.drawings;
    const parsed = shapes
      .map((x: { shapes: string }) => {
        const parsedData = shapeSchema.safeParse(JSON.parse(x.shapes));
        if (parsedData.success) return parsedData.data;
        console.warn("Invalid shape data:", x.shapes);
        return null;
      })
      .filter(Boolean);
    return parsed as Shapes[];
  } catch (err) {
    console.log("Failed to fetch shapes", err);
    return [];
  }
}

export default initdraw;
