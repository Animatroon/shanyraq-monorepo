// src/pages/admin/AdminLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

// import { useAdminAuthStore } from '../../store/admin/adminAuthSlice';
// import Button from '../../components/UI/button/Button';
import './AdminLayout.scss'; // Подключаем стили

const AdminLayout = () => {
    // Получаем функцию logout из стора
    // const logout = useAdminAuthStore((state) => state.logout);
    // const navigate = useNavigate(); // Хук для навигации

    // const handleLogout = async () => {
    //     // Передаем navigate в logout для выполнения редиректа после очистки стейта
    //     await logout(navigate);
    // };

    const getNavLinkClass = ({ isActive }) => {
        return isActive ? 'admin-nav-link active' : 'admin-nav-link';
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h3>Админ-панель</h3>
                </div>
                <nav className="admin-sidebar-nav">
                    <ul>
                        <li><NavLink to="/admin/dashboard" className={getNavLinkClass}>Дашборд</NavLink></li>
                        <li><NavLink to="/admin/tenants" className={getNavLinkClass}>Арендаторы</NavLink></li>
                        <li><NavLink to="/Admin/landlords" className={getNavLinkClass}>Арендодатели</NavLink></li>
                        <li><NavLink to="/admin/complaints" className={getNavLinkClass}>Жалобы</NavLink></li>
                        <li><NavLink to="/admin/chat" className={getNavLinkClass}>Чат</NavLink></li>
                    </ul>
                </nav>
                {/* <div className="admin-sidebar-footer">
                     <Button text="Выйти" onClick={handleLogout} />
                </div> */}
            </aside>
            <main className="admin-main-content">
                <Outlet /> {/* Здесь рендерятся дочерние страницы админки */}
            </main>
        </div>
    );
};

export default AdminLayout;