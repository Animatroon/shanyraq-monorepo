import React, { useEffect } from 'react';
import './alert-modal.scss';

export default function AlertModal({ message, onClose, duration }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    if (duration) {
      const timeout = setTimeout(onClose, duration);
      return () => {
        clearTimeout(timeout);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, duration]);

  return (
    <div className="alert-backdrop">
      <div className="alert-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <p>{message}</p>
      </div>
    </div>
  );
}
