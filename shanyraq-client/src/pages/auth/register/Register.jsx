// src/pages/register/register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../../layout/Layout';
import RoleSwitch from '../../../components/UI/role-switch/RoleSwitch';
import useAuthStore from '../../../store/auth/authStore';
import './register.scss';
import axios from 'axios';
import { Link } from 'react-router-dom';


export default function Register() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [certPassword, setCertPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { role, setRole } = useAuthStore();
  const navigate = useNavigate();

  const onFileSelected = (e) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Загрузите ЭЦП-файл');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('file', selectedFile);
    formData.append('passwordForbuffer', certPassword);

    const endpoint =
      role === 'Арендодатель'
      ? `${process.env.REACT_APP_API_URL}/Landlord/register`
      : `${process.env.REACT_APP_API_URL}/Tenant/register`;

    try {
      await axios.post(endpoint, formData);
      navigate('/login');
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (
    <AuthLayout>
      <div className="auth-page">
        <div className="auth-card">
          <h1>{role === 'Арендодатель' ? 'Регистрация арендодателя' : 'Регистрация арендатора'}</h1>
          <RoleSwitch onChange={setRole} />
          <form onSubmit={onSubmit}>
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

            <label>Телефон</label>
            <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} />

            <label>Пароль</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />

            <label>ЭЦП-файл (.p12)</label>
            <input type="file" onChange={onFileSelected} />

            <label>Пароль к ЭЦП</label>
            <input type="password" value={certPassword} onChange={(e) => setCertPassword(e.target.value)} />

            <button type="submit">Зарегистрироваться</button>

            {errorMessage && <p className="error">{errorMessage}</p>}
          </form>
          <p className="switch-link">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
