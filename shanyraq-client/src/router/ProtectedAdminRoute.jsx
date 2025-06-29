// src/router/ProtectedAdminRoute.jsx
import React, { useEffect, useState, useCallback } from 'react';
// Возвращаем Outlet и Navigate
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuthStore, selectIsAdminAuthenticated } from '../store/admin/adminAuthSlice';
import { adminRefresh } from '../api/admin/index';

// Убираем проп 'element'
const ProtectedAdminRoute = () => {
    const isAdmin = useAdminAuthStore(selectIsAdminAuthenticated);
    const setCredentials = useAdminAuthStore((state) => state.setCredentials);
    const logout = useAdminAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(!isAdmin);

    const logoutCallback = useCallback(async () => {
        console.log("Protected Route: Logging out...");
        await logout(navigate);
    }, [logout, navigate]);

    useEffect(() => {
        let isMounted = true;
        console.log("Protected Route useEffect: isAdmin =", isAdmin, "isLoading =", isLoading);
        const checkToken = async () => { /* ... (код проверки токена без изменений) ... */
            console.log("Protected Route: Checking token...");
            try {
                const data = await adminRefresh();
                console.log("Protected Route: Refresh API response:", data);
                if (data.access && isMounted) {
                    console.log("Protected Route: Refresh successful, setting credentials.");
                    setCredentials({ token: data.access });
                } else if (isMounted) {
                    console.log("Protected Route: Refresh didn't return token, logging out.");
                    await logoutCallback();
                }
            } catch (error) {
                console.error("Protected Route: Refresh failed.", error?.message || error);
                if (isMounted) { await logoutCallback(); }
            } finally {
                if (isMounted) { setIsLoading(false); }
            }
        };
        if (!isAdmin) checkToken(); else setIsLoading(false);
        return () => { isMounted = false; };
    }, [isAdmin, setCredentials, logoutCallback]);

    if (isLoading) {
        return <div>Проверка авторизации администратора...</div>;
    }

    const finalIsAdmin = useAdminAuthStore.getState().isAdmin;
    console.log("Protected Route Render: isLoading =", isLoading, "isAdmin =", finalIsAdmin);

    // Если авторизован, рендерим <Outlet />, который покажет вложенный роут
    return finalIsAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedAdminRoute;