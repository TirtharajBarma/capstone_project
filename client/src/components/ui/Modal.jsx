import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
  size = 'default',
  showCloseButton = true 
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        className={cn(
          'relative w-full bg-white rounded-xl shadow-2xl m-4 max-h-[90vh] overflow-auto',
          sizes[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            {title && (
              <h2 className="text-xl font-semibold text-gradient">{title}</h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="ml-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const ModalHeader = ({ children, className }) => (
  <div className={cn('mb-4', className)}>
    {children}
  </div>
);

const ModalTitle = ({ children, className }) => (
  <h3 className={cn('text-lg font-semibold text-gradient', className)}>
    {children}
  </h3>
);

const ModalDescription = ({ children, className }) => (
  <p className={cn('text-neutral-600 mt-1', className)}>
    {children}
  </p>
);

const ModalFooter = ({ children, className }) => (
  <div className={cn('flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-200', className)}>
    {children}
  </div>
);

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter };