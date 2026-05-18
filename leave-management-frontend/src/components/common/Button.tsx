import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600/80 backdrop-blur-md border border-blue-400/30 text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-blue-600/90 active:bg-blue-700/90',
    secondary: 'bg-white/30 backdrop-blur-md border border-white/50 text-[#00236f] shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-white/50 active:bg-white/60',
    danger: 'bg-red-500/80 backdrop-blur-md border border-red-400/30 text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-red-500/90 active:bg-red-600/90',
    success: 'bg-green-500/80 backdrop-blur-md border border-green-400/30 text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-green-500/90 active:bg-green-600/90',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
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

export default Button;