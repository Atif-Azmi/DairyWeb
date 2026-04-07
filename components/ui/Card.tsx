import React from "react";

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div
      className={`bg-white/90 rounded-xl shadow-card border border-border/80 ${className}`}
    >
      <div className="p-4 border-b border-border/80 bg-cream-50/50 rounded-t-xl">
        <h3 className="text-lg font-semibold text-foreground">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

export default Card;
