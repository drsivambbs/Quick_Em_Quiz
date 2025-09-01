
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-6 py-3 font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4';
  
  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-400 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 focus:ring-slate-500 text-slate-100',
  };

  const disabledStyles = 'disabled:bg-slate-500 disabled:cursor-not-allowed disabled:transform-none';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
