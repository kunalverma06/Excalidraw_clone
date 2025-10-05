import React, { RefObject, useState } from 'react';
import { Square, Circle, ArrowRight, Eraser, Hand, Type, Minus, Triangle } from 'lucide-react';

type NavbarProps = {
  activeTool: RefObject<string>;
};

const Navbar = ({ activeTool }: NavbarProps) => {
  // dummy state to force re-renders
  const [tick, setTick] = useState(0);

  const tools = [
    { id: 'select', icon: Hand, label: 'Select' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  const activeIndex = tools.findIndex(t => t.id === activeTool.current);

  return (
    <div className=" absolute left-1/2 -translate-x-1/2 flex items-center p-4 ">
      <div className="relative rounded-2xl shadow-lg border-2 z-10 border-gray-200 p-2 flex gap-1 overflow-hidden bg-red-300">
        {/* Animated background indicator */}
        <div
          className="absolute top-2 h-[calc(100%-16px)] w-12 bg-gradient-to-br bg-gray-200/50 rounded-xl transition-all duration-300 ease-out z-20"
          style={{ transform: `translateX(${activeIndex * 3.24}rem)` }}
        />

        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool.current === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => {
                activeTool.current = tool.id;
                setTick(t => t + 1); // 🔥 force re-render
                console.log(tool.id);
              }}
              className={`
                relative w-12 h-12 flex items-center justify-center rounded-xl
                transition-all duration-300 ease-out group
                ${isActive
                  ? 'text-white scale-110 '
                  : 'text-gray-600 hover:bg-gray-100 hover:scale-105'}
              `}
              title={tool.label}
            >
              <Icon
                className={`
                  w-5 h-5 transition-all duration-300 
                  ${isActive ? 'scale-110' : 'group-hover:scale-110 '}
                `}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="
                absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5
                bg-gray-900 text-black text-sm rounded-md whitespace-nowrap
                opacity-100 pointer-events-none
                transition-opacity duration-200 z-50 
              ">
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navbar;
