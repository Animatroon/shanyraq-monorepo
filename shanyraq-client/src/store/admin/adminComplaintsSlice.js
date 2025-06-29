// src/store/admin/adminComplaintsSlice.js
import { create } from 'zustand';
import { getTenantComplaints, getLandlordComplaints, setComplaintStatus } from '../../api/admin/index';

const initialPagination = { currentPage: 1, totalPages: 1, totalItems: 0, limit: 10 }; // Добавим лимит по умолчанию

export const useAdminComplaintsStore = create((set, get) => ({
    tenantComplaints: [],
    landlordComplaints: [],
    tenantPagination: { ...initialPagination },
    landlordPagination: { ...initialPagination },
    loadingTenants: false,
    loadingLandlords: false,
    error: null,
    statusFilter: 'all', // Добавляем фильтр по статусу

    setError: (error) => set({ error }),

    setStatusFilter: (status) => {
        // Устанавливаем фильтр и перезагружаем данные для активной вкладки
        set({ statusFilter: status });
        // Мы не знаем активную вкладку здесь, перезагрузка должна инициироваться из компонента
        // Или можно хранить activeTab в сторе и перезагружать тут
    },

    // type: 'tenants' | 'landlords'
    fetchComplaints: async (type, page = 1) => {
        const loadingKey = type === 'tenants' ? 'loadingTenants' : 'loadingLandlords';
        const listKey = type === 'tenants' ? 'tenantComplaints' : 'landlordComplaints';
        const paginationKey = type === 'tenants' ? 'tenantPagination' : 'landlordPagination';
        const apiCall = type === 'tenants' ? getTenantComplaints : getLandlordComplaints;
        const limit = get()[paginationKey].limit; 
        const status = get().statusFilter; 


        set({ [loadingKey]: true, error: null });
        try {
            const data = await apiCall(page, limit, status);
            set({
                [listKey]: data.complaints || [],
                [paginationKey]: {
                    currentPage: data.currentPage || 1,
                    totalPages: data.totalPages || 1,
                    totalItems: data.totalComplaints || 0,
                    limit: limit // Сохраняем лимит
                },
                [loadingKey]: false,
            });
        } catch (error) {
            console.error(`Error fetching ${type} complaints:`, error);
            set({ error: error.message || `Не удалось загрузить жалобы (${type})`, [loadingKey]: false });
        }
    },

    updateStatus: async (complaintId, type, newStatus) => {
         set({ error: null });
         const listKey = type === 'tenants' ? 'tenantComplaints' : 'landlordComplaints';
         try {
             const result = await setComplaintStatus(complaintId, type, newStatus);
             if (result && result.complaint) {
                  set((state) => ({
                      // Обновляем статус в списке
                      [listKey]: state[listKey].map(c =>
                          c._id === complaintId ? { ...c, status: newStatus } : c
                      ),
                  }));
                  return true; // Успех
             } else {
                  throw new Error('Не удалось обновить статус (нет данных в ответе)');
             }
         } catch (error) {
             console.error(`Error updating status for ${type} complaint ${complaintId}:`, error);
              set({ error: error.message || 'Не удалось обновить статус жалобы' });
              return false; // Неудача
         }
    },
}));

export const selectComplaintData = (type) => (state) => ({
    complaints: type === 'tenants' ? state.tenantComplaints : state.landlordComplaints,
    pagination: type === 'tenants' ? state.tenantPagination : state.landlordPagination,
    loading: type === 'tenants' ? state.loadingTenants : state.loadingLandlords,
    error: state.error,
    statusFilter: state.statusFilter,
});