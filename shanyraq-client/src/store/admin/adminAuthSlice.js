import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { adminLogout as adminLogoutApi } from '../../api/admin/index';


export const useAdminAuthStore = create(
  persist(
      (set, get) => ({
          token: null,
          isAdmin: false,
          adminInfo: null,

          setCredentials: ({ token, admin = null }) => {
              set({
                  token: token,
                  isAdmin: !!token, // isAdmin становится true, если токен есть
                  adminInfo: admin ?? get().adminInfo, // Обновляем инфо, если передано, иначе оставляем старое
              });
          },

          logout: async (navigate) => {
              const currentToken = get().token;
              set({ token: null, isAdmin: false, adminInfo: null });

              if (currentToken) {
                  try {
                      await adminLogoutApi();
                  } catch (error) {
                      console.error("Admin logout API call failed (ignoring):", error);
                  }
              }

              if (navigate && typeof navigate === 'function') {
                  navigate('/admin/login', { replace: true });
              } else if (window.location.pathname !== '/admin/login') {
                  window.location.assign('/admin/login'); // Используем assign для полной перезагрузки, если нужно
              }
          },

          setAdminInfo: (admin) => {
              set({ adminInfo: admin });
          },
      }),
      {
          name: 'admin-auth-storage', // Ключ в localStorage
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
              token: state.token,
              isAdmin: state.isAdmin,
          }),
      }
  )
);

export const selectAdminToken = (state) => state.token;
export const selectIsAdminAuthenticated = (state) => state.isAdmin;
export const selectAdminInfo = (state) => state.adminInfo;