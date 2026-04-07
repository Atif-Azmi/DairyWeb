import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-foreground/80 mb-1"
      >
        {label}
        {props.required ? <span className="text-destructive ml-1">*</span> : null}
      </label>
      <input
        id={id}
        className={`flex h-10 w-full rounded-md border border-border bg-white/80 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
