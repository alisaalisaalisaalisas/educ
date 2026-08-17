import React, { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  message: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!visible || !message) return null;

  return (
    <div className={`toast ${message.type === 'error' ? 'toast--error' : ''}`}>
      {message.type === 'success' ? '✓ ' : message.type === 'error' ? '✗ ' : 'ℹ '}
      {message.text}
    </div>
  );
};
