import { useAdminAuthStore, selectIsAdminAuthenticated, selectAdminInfo } from "../store/admin/adminAuthSlice";

export const useAdminAuth = () => {
    const isAdmin = useAdminAuthStore(selectIsAdminAuthenticated);
    const adminInfo = useAdminAuthStore(selectAdminInfo);
    const token = useAdminAuthStore(state => state.token);
    const logout = useAdminAuthStore(state => state.logout);

    return {
        isAdmin,
        adminInfo,
        token,
        logout,
    };
};

// Использовать в компонентах: const { isAdmin, adminInfo } = useAdminAuth();