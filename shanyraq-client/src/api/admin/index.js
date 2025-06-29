// src/api/admin/index.js
import api from '../axios';

// --- Auth ---
export const adminLogin = async (credentials) => {
    try {
        const response = await api.post('/Admin/login', credentials);
        return response.data;
    } catch (error) {
        console.error("API Error: adminLogin", error.response?.data || error.message);
        throw error.response?.data || new Error(error.message || 'Ошибка входа');
    }
};

export const adminRefresh = async () => {
    try {
        const response = await api.post('/Admin/refresh');
        return response.data;
    } catch (error) {
        console.error("API Error: adminRefresh", error.response?.data || error.message);
        throw error.response?.data || new Error(error.message || 'Ошибка обновления токена');
    }
};

export const adminLogout = async () => {
    try {
        const response = await api.post('/Admin/logout');
        return response.data;
    } catch (error) {
        console.error("API Error: adminLogout (ignoring)", error.response?.data || error.message);
    }
};

// --- User Management ---
export const getTenants = async (page = 1, limit = 10) => {
    try {
        const response = await api.get('/Admin/tenants', { params: { page, limit } });
        return response.data;
    } catch (error) {
        console.error("API Error: getTenants", error.response?.data || error.message);
        throw error.response?.data || new Error('Ошибка загрузки арендаторов');
    }
};

export const getLandlords = async (page = 1, limit = 10) => {
    try {
        const response = await api.get('/Admin/landlords', { params: { page, limit } });
        return response.data;
    } catch (error) {
        console.error("API Error: getLandlords", error.response?.data || error.message);
        throw error.response?.data || new Error('Ошибка загрузки арендодателей');
    }
};

export const blacklistUser = async (userId, userType, reason) => {
    try {
        const response = await api.post('/Admin/users/blacklist', { userId, userType, reason });
        return response.data;
    } catch (error) {
        console.error("API Error: blacklistUser", error.response?.data || error.message);
        throw error.response?.data || new Error('Ошибка блокировки пользователя');
    }
};

export const unblacklistUser = async (userId, userType) => {
    try {
        const response = await api.post('/Admin/users/unblacklist', { userId, userType });
        return response.data;
    } catch (error) {
        console.error("API Error: unblacklistUser", error.response?.data || error.message);
        throw error.response?.data || new Error('Ошибка разблокировки пользователя');
    }
};

// --- Complaint Management ---
export const getTenantComplaints = async (page = 1, limit = 10, status = 'all') => {
    try {
        const response = await api.get('/Admin/complaints/tenants', { params: { page, limit, status } });
        return response.data;
    } catch (error) {
        console.error("API Error: getTenantComplaints", error.response?.data || error.message);
        throw error.response?.data || new Error('Ошибка загрузки жалоб арендаторов');
    }
};

export const getLandlordComplaints = async (page = 1, limit = 10, status = 'all') => {
     try {
        const response = await api.get('/Admin/complaints/landlords', { params: { page, limit, status } });
        return response.data;
    } catch (error) {
        console.error("API Error: getLandlordComplaints", error.response?.data || error.message);
        throw error.response?.data || new Error('Ошибка загрузки жалоб арендодателей');
    }
};

export const setComplaintStatus = async (complaintId, type, status) => {
    // type: 'tenants' или 'landlords'
    try {
        const response = await api.patch(`/Admin/complaints/${type}/${complaintId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error("API Error: setComplaintStatus", error.response?.data || error.message);
        throw error.response?.data || new Error('Ошибка изменения статуса жалобы');
    }
};

// --- Chat Management ---
export const getAdminChats = async (page = 1, limit = 30) => {
    try {
        const response = await api.get('/Admin/chats', { params: { page, limit } });
        return response.data;
    } catch (error) {
        console.error("API Error: getAdminChats", error.response?.data || error.message);
        throw error.response?.data || new Error('Ошибка загрузки админских чатов');
    }
};

export const getAdminChatMessages = async (chatId, page = 1, limit = 50) => {
     try {
        const response = await api.get(`/Admin/chats/${chatId}/messages`, { params: { page, limit } });
        return response.data;
    } catch (error) {
        console.error("API Error: getAdminChatMessages", error.response?.data || error.message);
        throw error.response?.data || new Error('Ошибка загрузки сообщений админского чата');
    }
};

// --- House Management (Admin view) ---
export const getLandlordHouses = async (landlordId, page = 1, limit = 10) => {
    try {
        const response = await api.get(`/Admin/landlords/${landlordId}/houses`, { params: { page, limit } });
        return response.data;
    } catch (error) {
        console.error("API Error: getLandlordHouses", error.response?.data || error.message);
        throw error.response?.data || new Error('Ошибка загрузки домов арендодателя');
    }
};

// --- Admin Creation (если нужно вызывать с фронта) ---
// export const createAdmin = async (adminData) => { ... }

// --- Complaints ---
// Добавь сюда функции для получения и обновления жалоб
// export const getTenantComplaints = async (...) => { ... }
// export const getLandlordComplaints = async (...) => { ... }
// export const setComplaintStatus = async (...) => { ... }

// --- Chat ---
// Добавь сюда функции для работы с чатом админа
// export const getAdminChats = async (...) => { ... }
// export const getAdminChatMessages = async (...) => { ... }