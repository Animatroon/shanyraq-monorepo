// src/pages/admin/AdminLoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore, selectIsAdminAuthenticated } from '../../../store/admin/adminAuthSlice';
import { adminLogin } from '../../../api/admin/index';
import Button from '../../../components/UI/button/Button';
import Input from '../../../components/UI/input/Input'; 
import AlertModal from '../../../components/UI/alert-modal/AlertModal'; 
import './AdminLoginPage.scss';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const setCredentials = useAdminAuthStore((state) => state.setCredentials);
    const isAuthenticated = useAdminAuthStore(selectIsAdminAuthenticated);

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    useEffect(() => {
        console.log('AdminLoginPage Mount/Auth Check: isAuthenticated =', isAuthenticated);
        if (isAuthenticated) {
            console.log('Redirecting to /admin/dashboard because already authenticated.');
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const closeErrorModal = () => {
        setShowErrorModal(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setShowErrorModal(false);
        setLoading(true);
        console.log('LOGIN SUBMIT: Attempting admin login with:', { login, password });


        if (!login || !password) {
             setError("Email и пароль не могут быть пустыми.");
             setShowErrorModal(true);
             setLoading(false);
             return;
        }

        try {
            const data = await adminLogin({ login: login, password: password });
            console.log('LOGIN SUBMIT: API call returned:', data); 

            if (data && data.access) {
                console.log('LOGIN SUBMIT: Login successful, setting credentials...');

                setCredentials({ token: data.access });
                // Редирект произойдет из useEffect после обновления isAuthenticated
                // Если useEffect не срабатывает сразу, можно добавить navigate здесь:
                // navigate('/admin/dashboard', { replace: true });
            } else {
                // Если API отработало, но не вернуло токен
                const message = 'Сервер не вернул токен доступа. Ответ сервера: ' + JSON.stringify(data);
                console.error(message);
                setError(message);
                setShowErrorModal(true);
            }
        } catch (err) {
            // Обрабатываем ошибку, переброшенную из API функции
            // err здесь должен содержать { message: '...' } или быть объектом Error
            const errorMessage = err?.message || 'Неизвестная ошибка при входе.';
             console.error("LOGIN SUBMIT: Submit Error:", err); // Логируем ПОЛНУЮ ошибку
             setError(`Ошибка входа: ${errorMessage}`);
             setShowErrorModal(true);
        } finally {
            setLoading(false); // Снимаем флаг загрузки в любом случае
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <h2>Вход для Администратора</h2>
                {/* Используем onSubmit на форме */}
                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="input-group">
                    <label htmlFor="admin-login">Логин:</label>
                        <Input
                            type="text" 
                            id="admin-login"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)} 
                            placeholder="Ваш логин (email)"
                            required
                            disabled={loading}
                            autoComplete="username" // Поможет браузеру
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="admin-password">Пароль:</label>
                        <Input type="password" id="admin-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" required disabled={loading} autoComplete="current-password" />
                    </div>
                    <Button
                        text={loading ? 'Вход...' : 'Войти'}
                        type="submit"
                        disabled={loading || !login || !password} // Добавляем проверку login
                    />
                </form>
            </div>
            {/* Модальное окно для ошибок */}
            {showErrorModal && (<AlertModal message={error} onClose={closeErrorModal} />)}
        </div>
    );
};

export default AdminLoginPage;