import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-medium transition-all duration-200 rounded-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 border border-transparent",
    secondary: "bg-slate-700 text-zinc-200 hover:bg-slate-600 border border-slate-600",
    danger: "bg-red-500 text-white hover:bg-red-600 border border-transparent",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs sm:px-3 sm:py-1.5",
    md: "px-6 py-3 text-sm sm:px-5 sm:py-2.5",
    lg: "px-8 py-4 text-base sm:py-3",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};