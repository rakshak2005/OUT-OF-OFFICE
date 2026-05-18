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
    primary: 'bg-blue-500/70 backdrop-blur-xl border border-white/30 text-white shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] hover:bg-blue-500/80 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.3)] hover:-translate-y-0.5 active:bg-blue-600/80',
    secondary: 'bg-white/50 backdrop-blur-xl border border-white/60 text-[#00236f] shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] hover:bg-white/70 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:-translate-y-0.5 active:bg-white/80',
    danger: 'bg-rose-500/70 backdrop-blur-xl border border-white/30 text-white shadow-[0_8px_32px_0_rgba(225,29,72,0.2)] hover:bg-rose-500/80 hover:shadow-[0_8px_32px_0_rgba(225,29,72,0.3)] hover:-translate-y-0.5 active:bg-rose-600/80',
    success: 'bg-emerald-500/70 backdrop-blur-xl border border-white/30 text-white shadow-[0_8px_32px_0_rgba(16,185,129,0.2)] hover:bg-emerald-500/80 hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:bg-emerald-600/80',
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