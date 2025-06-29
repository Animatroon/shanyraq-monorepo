// src/store/admin/adminUsersSlice.js
import { create } from 'zustand';
import { getTenants, getLandlords, blacklistUser, unblacklistUser } from '../../api/admin/index';
import { produce } from 'immer'; 

const initialPagination = { currentPage: 1, totalPages: 1, totalItems: 0, limit: 10 };

export const useAdminUsersStore = create((set, get) => ({
    tenants: [],
    landlords: [],
    tenantPagination: { ...initialPagination },
    landlordPagination: { ...initialPagination },
    loadingTenants: false,
    loadingLandlords: false,
    error: null,

    setError: (error) => set({ error }),

    fetchTenants: async (page = 1) => {
        const limit = get().tenantPagination.limit;
        set({ loadingTenants: true, error: null });
        try {
            const data = await getTenants(page, limit);
            set({
                tenants: data.tenants || [],
                tenantPagination: {
                    currentPage: data.currentPage || 1,
                    totalPages: data.totalPages || 1,
                    totalItems: data.totalTenants || 0,
                    limit: limit
                },
                loadingTenants: false,
            });
        } catch (error) {
            console.error("Error fetching tenants:", error);
            set({ error: error.message || 'Не удалось загрузить арендаторов', loadingTenants: false });
        }
    },

    fetchLandlords: async (page = 1) => {
        const limit = get().landlordPagination.limit;
        set({ loadingLandlords: true, error: null });
        try {
            const data = await getLandlords(page, limit);
            set({
                landlords: data.landlords || [],
                landlordPagination: {
                    currentPage: data.currentPage || 1,
                    totalPages: data.totalPages || 1,
                    totalItems: data.totalLandlords || 0,
                    limit: limit
                },
                loadingLandlords: false,
            });
        } catch (error) {
            console.error("Error fetching landlords:", error);
            set({ error: error.message || 'Не удалось загрузить арендодателей', loadingLandlords: false });
        }
    },

    // Бан/разбан пользователя
    toggleUserBlacklist: async (userId, userType, isCurrentlyBlacklisted, reason = undefined) => {
        set({ error: null });
        const apiCall = isCurrentlyBlacklisted
            ? () => unblacklistUser(userId, userType)
            : () => blacklistUser(userId, userType, reason);
        const actionVerb = isCurrentlyBlacklisted ? 'разблокирован' : 'заблокирован';

        try {
            const result = await apiCall();
            if (result && result.user) {
                const listKey = userType === 'tenant' ? 'tenants' : 'landlords';
               
                set(produce((state) => {
                    const userIndex = state[listKey].findIndex(user => user._id === userId);
                    if (userIndex !== -1) {
                        state[listKey][userIndex].isBlacklisted = !isCurrentlyBlacklisted;
                        state[listKey][userIndex].blacklistReason = isCurrentlyBlacklisted ? undefined : reason;
                    }
                }));
                console.log(`User ${userId} (${userType}) successfully ${actionVerb}`);
                return true; 
            } else {
                 throw new Error(`Не получен пользователь после ${actionVerb}ия`);
            }
        } catch (error) {
            console.error(`Error toggling blacklist for user ${userId} (${userType}):`, error);
            set({ error: error.message || `Не удалось ${actionVerb.slice(0, -2)}ь пользователя` });
            return false; 
        }
    },
}));

// export const selectTenantsData = (state) => ({ ... });
// export const selectLandlordsData = (state) => ({ ... });