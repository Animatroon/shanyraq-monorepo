import React from 'react';
import './select.scss';

export default function Select({ value, onChange, children, ...rest }) {
  return (
    <select className="custom-select" value={value} onChange={onChange} {...rest}>
      {children}
    </select>
  );
}
