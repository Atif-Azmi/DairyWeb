"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "destructive" | "outline" | "ghost";
}

const Button: React.FC<ButtonProps> = ({
  className = "",
  variant = "primary",
  type,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-5 py-2.5 active:scale-95 shadow-sm";

  const variantClasses = {
    primary: "bg-gradient-to-r from-primary to-emerald-500 text-white hover:shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] border border-transparent hover:brightness-110",
    destructive:
      "bg-gradient-to-r from-red-600 to-rose-500 text-white hover:shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] border border-transparent",
    outline:
      "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm",
    ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-none",
  };

  return (
    <button
      type={type ?? "button"}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
};

export default Button;
