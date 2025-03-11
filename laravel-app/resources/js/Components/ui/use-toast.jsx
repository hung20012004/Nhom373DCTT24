import { useState, useEffect, useRef } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const toastIdCounter = useRef(0);

  // Function to add a new toast
  const toast = ({ title, description, type = 'default', duration = 5000 }) => {
    const id = toastIdCounter.current++;

    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id,
        title,
        description,
        type,
        duration,
      },
    ]);

    return id;
  };

  // Function to dismiss a toast
  const dismiss = (toastId) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId)
    );
  };

  // Auto-dismiss toasts based on their duration
  useEffect(() => {
    const timers = toasts.map((toast) => {
      if (toast.duration === Infinity) return null;

      const timer = setTimeout(() => {
        dismiss(toast.id);
      }, toast.duration);

      return { id: toast.id, timer };
    }).filter(Boolean);

    return () => {
      timers.forEach(({ timer }) => clearTimeout(timer));
    };
  }, [toasts]);

  return {
    toast,
    dismiss,
    toasts,
  };
}

// Additional utility functions
export const useToastContext = () => {
  const context = useToast();

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};

// Predefined toast types for convenience
export const toastTypes = {
  default: (props) => toast({ ...props, type: 'default' }),
  success: (props) => toast({ ...props, type: 'success' }),
  error: (props) => toast({ ...props, type: 'error' }),
  warning: (props) => toast({ ...props, type: 'warning' }),
  info: (props) => toast({ ...props, type: 'info' }),
};
