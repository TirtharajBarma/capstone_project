import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ 
  className, 
  type = 'text',
  label,
  error,
  icon,
  iconPosition = 'left',
  variant = 'default',
  ...props 
}, ref) => {
  const baseStyles = 'w-full rounded-xl transition-colors transition-transform transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    default: 'bg-white/80 border border-neutral-300 text-neutral-900 placeholder-neutral-500 focus:border-primary-500 focus:ring-primary-500/20',
    neumorph: 'neumorph-card border-0 text-neutral-900 placeholder-neutral-500 focus:shadow-neumorph-inset',
    glass: 'glass-card text-white placeholder-white/70 focus:bg-white/20',
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    default: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const inputId = React.useId();
  
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" aria-hidden="true">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          autoComplete={props.autocomplete}
          className={cn(
            baseStyles,
            variants[variant],
            sizes.default,
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;