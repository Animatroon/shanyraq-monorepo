import React, { useEffect, useState } from 'react';
import './role-switch.scss';

export default function RoleSwitch({ onChange }) {
  const roles = ['Арендатор', 'Арендодатель'];
  const [selected, setSelected] = useState('Арендатор');

  useEffect(() => {
    const saved = localStorage.getItem('userRole');
    if (saved && roles.includes(saved)) {
      setSelected(saved);
      onChange(saved);
    }
  }, []);

  const switchRole = (role) => {
    setSelected(role);
    localStorage.setItem('userRole', role);
    onChange(role);
  };

  return (
    <div className="role-switch">
      {roles.map((role) => (
        <button
          key={role}
          className={selected === role ? 'active' : ''}
          onClick={() => switchRole(role)}
        >
          {role}
        </button>
      ))}
    </div>
  );
}
