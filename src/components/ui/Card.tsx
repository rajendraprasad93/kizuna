import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm ${hover ? 'transition-all duration-300 hover:shadow-md hover:border-slate-300 cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
