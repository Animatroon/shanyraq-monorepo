import React from 'react';
import './input.scss';

export default function Input({ value, onChange, placeholder, ...rest }) {
  return (
    <input
      className="custom-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...rest}
    />
  );
}
