// src/pages/admin/AdminLandlordsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
// Импортируем хук
import { useAdminUsersStore } from '../../store/admin/adminUsersSlice';
import AdminUserTable from '../../components/admin/AdminUserTable';
import AdminPagination from '../../components/admin/AdminPagination';
import AlertModal from '../../components/UI/alert-modal/AlertModal';

import { shallow } from 'zustand/shallow';


const AdminLandlordsPage = () => {
    console.log("RENDERING: AdminLandlordsPage");

    const landlords = useAdminUsersStore((state) => state.landlords);
    const pagination = useAdminUsersStore((state) => state.landlordPagination);
    const loading = useAdminUsersStore((state) => state.loadingLandlords);
    const error = useAdminUsersStore((state) => state.error);
    const fetchLandlords = useAdminUsersStore((state) => state.fetchLandlords);
    const toggleUserBlacklist = useAdminUsersStore((state) => state.toggleUserBlacklist);
    const setError = useAdminUsersStore((state) => state.setError);


    const [togglingUserId, setTogglingUserId] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);


    useEffect(() => {
        console.log("AdminLandlordsPage useEffect [fetchLandlords]: Fetching landlords, page 1");

        fetchLandlords(1);
    }, [fetchLandlords]);

    useEffect(() => {
        if (error) {
            console.log("AdminLandlordsPage useEffect [error]: Error detected", error);
            setShowErrorModal(true);
        }
    }, [error]);


    const handlePageChange = useCallback((newPage) => {
        console.log("AdminLandlordsPage: Changing page to", newPage);
        fetchLandlords(newPage);
    }, [fetchLandlords]); 
    const handleToggleBlacklist = useCallback(async (userId, userType, isCurrentlyBlacklisted, reason) => {
        console.log(`AdminLandlordsPage: Toggling blacklist for ${userType} ${userId}...`);
        setTogglingUserId(userId);
        await toggleUserBlacklist(userId, userType, isCurrentlyBlacklisted, reason);
        setTogglingUserId(null);
    }, [toggleUserBlacklist]);

    const closeErrorModal = useCallback(() => {
        setShowErrorModal(false);
        setError(null);
    }, [setError]);

    return (
        <div>
            <h2>Управление Арендодателями</h2>
            {loading && !togglingUserId && <p>Загрузка арендодателей...</p>}

            <AdminUserTable
                users={landlords}
                userType="landlord"
                onToggleBlacklist={handleToggleBlacklist}
                loadingAction={togglingUserId}
            />

            {!loading && !error && landlords.length > 0 && (
                 <AdminPagination
                     currentPage={pagination.currentPage}
                     totalPages={pagination.totalPages}
                     onPageChange={handlePageChange}
                     loading={loading}
                 />
            )}
            {showErrorModal && error && (<AlertModal message={`Ошибка загрузки: ${error}`} onClose={closeErrorModal} />)}
        </div>
    );
};
export default AdminLandlordsPage;