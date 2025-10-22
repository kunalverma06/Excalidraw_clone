"use client";

import { HtmlHTMLAttributes, MouseEventHandler, ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  onClick?:MouseEventHandler<HTMLButtonElement>
 
}

export const Button = ({ children, className ,onClick}: ButtonProps) => {
  return (
    <button
    onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
};
