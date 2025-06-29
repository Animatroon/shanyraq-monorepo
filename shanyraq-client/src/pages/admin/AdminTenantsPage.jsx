
import React, { useEffect, useState, useCallback } from 'react';

import { useAdminUsersStore } from '../../store/admin/adminUsersSlice';

import AdminUserTable from '../../components/admin/AdminUserTable';
import AdminPagination from '../../components/admin/AdminPagination'; 
import AlertModal from '../../components/UI/alert-modal/AlertModal';


const AdminTenantsPage = () => {

  const tenants = useAdminUsersStore((state) => state.tenants);
  const pagination = useAdminUsersStore((state) => state.tenantPagination);
  const loading = useAdminUsersStore((state) => state.loadingTenants);
  const error = useAdminUsersStore((state) => state.error);
  const fetchTenants = useAdminUsersStore((state) => state.fetchTenants);
  const toggleUserBlacklist = useAdminUsersStore((state) => state.toggleUserBlacklist);
  const setError = useAdminUsersStore((state) => state.setError);

    const [togglingUserId, setTogglingUserId] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);

    useEffect(() => {
        console.log("AdminTenantsPage useEffect: Fetching tenants, page 1");
        fetchTenants(1, pagination.limit || 10);
    }, []); 

    useEffect(() => {
        if (error) {
             console.log("AdminTenantsPage useEffect: Error detected", error);
             setShowErrorModal(true);
        }
    }, [error]);

    const handlePageChange = useCallback((newPage) => {
        console.log("AdminTenantsPage: Changing page to", newPage);
        fetchTenants(newPage, pagination.limit);
    }, [fetchTenants, pagination.limit]);

    const handleToggleBlacklist = useCallback(async (userId, userType, isCurrentlyBlacklisted, reason) => {
        console.log(`AdminTenantsPage: Toggling blacklist for ${userType} ${userId}, currently blacklisted: ${isCurrentlyBlacklisted}`);
        setTogglingUserId(userId);
        await toggleUserBlacklist(userId, userType, isCurrentlyBlacklisted, reason);
        setTogglingUserId(null);
    }, [toggleUserBlacklist]);

    const closeErrorModal = useCallback(() => {
        setShowErrorModal(false);
        setError(null);
    }, [setError]);

     console.log("AdminTenantsPage Render: loading=", loading, "tenants count=", tenants.length, "error=", error);


    return (
        <div>
            <h2>Управление Арендаторами</h2>
            {loading && !togglingUserId && <p>Загрузка арендаторов...</p>}
            <AdminUserTable
                users={tenants}
                userType="tenant"
                onToggleBlacklist={handleToggleBlacklist}
                loadingAction={togglingUserId}
            />
            <AdminPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                loading={loading}
            />
            {showErrorModal && error && (<AlertModal message={error} onClose={closeErrorModal} />)}
        </div>
    );
};
export default AdminTenantsPage;