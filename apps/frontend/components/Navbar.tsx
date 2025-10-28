import React, { RefObject, useState, useEffect, SetStateAction } from 'react';
import {
  Square,
  Circle,
  ArrowRight,
  Eraser,
  Hand,
  Type,
  Minus,
  Triangle,
  Sun,
  Moon,
} from 'lucide-react';

type NavbarProps = {
  activeTool: RefObject<string>;
  darkMode: boolean
  setDarkMode: React.Dispatch<SetStateAction<boolean>>
};

const Navbar = ({ activeTool, darkMode, setDarkMode }: NavbarProps) => {
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

  // Apply dark/light theme to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="absolute left-1/2 -translate-x-1/2 flex items-center p-4">
      <div
        className={`
          relative rounded-2xl shadow-lg border-2 z-10 p-2 flex gap-1 overflow-hidden 
          transition-all duration-500
        ${darkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-pink-300/50 border-pink-400/50 backdrop-blur-md'}

        `}
      >
        {/* Animated background indicator */}
        <div
          className="absolute top-2 h-[calc(100%-16px)] w-12 bg-gray-200/50 dark:bg-gray-300/50 rounded-xl transition-all duration-300 ease-out z-20"
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
                setTick(t => t + 1);
              }}
              className={`
                relative w-12 h-12 flex items-center justify-center rounded-xl
                transition-all duration-300 ease-out group
                ${isActive
                  ? 'text-white scale-110'
                  : darkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:scale-105'}
              `}
              title={tool.label}
            >
              <Icon
                className={`w-5 h-5 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </button>
          );
        })}

        {/* 🌞 / 🌙 toggle button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`
            relative w-12 h-12 flex items-center justify-center rounded-xl
            transition-all duration-300 ease-out
            ${darkMode
              ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
              : 'bg-white text-gray-800 hover:bg-gray-200'}
          `}
          title="Toggle Dark Mode"
        >
          {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
