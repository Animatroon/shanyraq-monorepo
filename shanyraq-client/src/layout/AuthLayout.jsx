import React from 'react';
import './auth-layout.scss';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        {children}
      </div>
    </div>
  );
}
