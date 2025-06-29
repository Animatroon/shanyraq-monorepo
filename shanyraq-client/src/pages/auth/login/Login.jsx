import React, { useState } from 'react';
import AuthLayout from '../../../layout/Layout';
import RoleSwitch from '../../../components/UI/role-switch/RoleSwitch';
import useAuthStore from '../../../store/auth/authStore';
import './login.scss';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { role, setRole, setAccess } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = role === 'Арендодатель'
    ? `${process.env.REACT_APP_API_URL}/Landlord/login`
    : `${process.env.REACT_APP_API_URL}/Tenant/login`;

    try {
      const token = await axios.post(endpoint, { login, password }, {withCredentials: true});
      // localStorage.setItem('access', token.data.access);
      setAccess(token.data.access)
      setErrorMsg('');
      window.location.href = '/';
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Ошибка входа');
    }
  };

  return (
    <AuthLayout>
      <div className="auth-page">
        <div className="auth-card">
          <h1>{role === 'Арендодатель' ? 'Вход для арендодателя' : 'Вход арендатора'}</h1>
          <RoleSwitch onChange={setRole} />
          <form onSubmit={handleSubmit} noValidate>
            <label>Телефон или Email</label>
            <input type="text" value={login} onChange={e => setLogin(e.target.value)} required />

            <label>Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />

            <button type="submit">Войти</button>
            {errorMsg && <p className="error">{errorMsg}</p>}
          </form>
          <p className="switch-link">
            Нет аккаунта? <Link to="/register">Создай его</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}