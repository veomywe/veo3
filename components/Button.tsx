
import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const Spinner: React.FC<{ spinnerColor?: string }> = ({ spinnerColor = "text-white" }) => (
  <svg className={`animate-spin -ml-1 mr-2 h-5 w-5 ${spinnerColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


const Button: React.FC<ButtonProps> = ({ onClick, children, type = 'button', variant = 'primary', className = '', disabled = false, isLoading = false }) => {
  const baseStyles = "font-semibold py-2.5 px-5 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 transition duration-150 ease-in-out transform flex items-center justify-center";
  
  let variantStyles = "";
  let spinnerColor = "text-white";

  switch (variant) {
    case 'secondary':
      variantStyles = "bg-blue-500/50 hover:bg-blue-500/70 text-sky-100 focus:ring-sky-400 border border-blue-400/60";
      spinnerColor = "text-sky-100";
      break;
    case 'ghost':
      variantStyles = "bg-transparent hover:bg-sky-500/20 text-sky-300 focus:ring-sky-500 border border-sky-500/50";
      spinnerColor = "text-sky-300";
      break;
    case 'primary':
    default:
      variantStyles = "bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400";
      break;
  }

  const disabledStyles = "opacity-60 cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles} ${disabled || isLoading ? disabledStyles : 'hover:scale-105 active:scale-95'} ${className}`}
    >
      {isLoading && <Spinner spinnerColor={spinnerColor} />}
      {children}
    </button>
  );
};

export default Button;