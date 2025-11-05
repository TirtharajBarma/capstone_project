import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default', 
  children, 
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-glow transform hover:scale-105',
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-glow',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 shadow-lg hover:shadow-glow-purple',
    outline: 'border-2 border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-500',
    ghost: 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
    neumorph: 'neumorph-card text-neutral-700 hover:shadow-neumorph-inset',
    glass: 'glass-card text-white hover:bg-white/20',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    default: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
    icon: 'p-3',
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed hover:transform-none',
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="loading-dots">
          <div style={{ '--delay': '0s' }}></div>
          <div style={{ '--delay': '0.1s' }}></div>
          <div style={{ '--delay': '0.2s' }}></div>
        </div>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;