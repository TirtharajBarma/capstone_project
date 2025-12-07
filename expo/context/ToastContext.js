import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

// Create a ref that can be used outside of React components (e.g., in API interceptors)
export const toastRef = React.createRef();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info', // success, error, warning, info
  });

  const timerRef = useRef(null);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToast({
      visible: true,
      message,
      type,
    });

    // Don't auto-hide persistent errors if we want (optional, but good for UX)
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  // Assign the show method to the ref so it can be accessed globally
  if (toastRef) {
    toastRef.current = {
      show: ({ message, type, duration }) => showToast(message, type, duration),
      hide: hideToast,
    };
  }

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
