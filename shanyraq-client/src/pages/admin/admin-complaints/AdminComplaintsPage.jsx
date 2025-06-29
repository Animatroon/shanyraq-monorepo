// src/pages/admin/AdminComplaintsPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAdminComplaintsStore } from '../../../store/admin/adminComplaintsSlice';
import AdminComplaintTable from '../../../components/admin/AdminComplaintTable';
import AdminPagination from '../../../components/admin/AdminPagination';
import AlertModal from '../../../components/UI/alert-modal/AlertModal';
import Select from '../../../components/UI/select/Select';
import './AdminComplaintsPage.scss';

const STATUS_FILTER_OPTIONS = {
    all: 'Все',
    active: 'Активные',
    'in processing': 'В обработке',
    inactive: 'Закрытые',
};

const AdminComplaintsPage = () => {
    console.log("RENDERING: AdminComplaintsPage");

    const [activeTab, setActiveTab] = useState('tenants');


    const tenantComplaints = useAdminComplaintsStore((state) => state.tenantComplaints);
    const landlordComplaints = useAdminComplaintsStore((state) => state.landlordComplaints);
    const tenantPagination = useAdminComplaintsStore((state) => state.tenantPagination);
    const landlordPagination = useAdminComplaintsStore((state) => state.landlordPagination);
    const loadingTenants = useAdminComplaintsStore((state) => state.loadingTenants);
    const loadingLandlords = useAdminComplaintsStore((state) => state.loadingLandlords);
    const error = useAdminComplaintsStore((state) => state.error);
    const statusFilter = useAdminComplaintsStore((state) => state.statusFilter);
    const fetchComplaints = useAdminComplaintsStore((state) => state.fetchComplaints);
    const updateStatus = useAdminComplaintsStore((state) => state.updateStatus);
    const setError = useAdminComplaintsStore((state) => state.setError);
    const setStatusFilter = useAdminComplaintsStore((state) => state.setStatusFilter);


    const [loadingAction, setLoadingAction] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);

    
    const complaints = activeTab === 'tenants' ? tenantComplaints : landlordComplaints;
    const pagination = activeTab === 'tenants' ? tenantPagination : landlordPagination;
    const loading = activeTab === 'tenants' ? loadingTenants : loadingLandlords;

    useEffect(() => {
        console.log(`Complaints Effect: Fetching for tab=${activeTab}, filter=${statusFilter}, page=1`);
        setError(null);
        fetchComplaints(activeTab, 1);
    }, [fetchComplaints, activeTab, statusFilter, setError]);

    useEffect(() => {
        if (error) {
            console.log("Complaints Effect: Error detected", error);
            setShowErrorModal(true);
        }
    }, [error]);


    const handlePageChange = useCallback((newPage) => {
         console.log(`Complaints: Changing page for tab=${activeTab} to`, newPage);

        fetchComplaints(activeTab, newPage);
    }, [fetchComplaints, activeTab]);

    const handleStatusChange = useCallback(async (complaintId, complaintType, newStatus) => {
        console.log(`Complaints: Updating status for ${complaintType} ${complaintId} to ${newStatus}`);
        setLoadingAction(complaintId);
        await updateStatus(complaintId, complaintType, newStatus);
        setLoadingAction(null);
    }, [updateStatus]);

    const closeErrorModal = useCallback(() => {
        setShowErrorModal(false);
        setError(null);
    }, [setError]);

    const handleFilterChange = useCallback((e) => {
         console.log("Complaints: Filter changed to", e.target.value);
         setStatusFilter(e.target.value);
    }, [setStatusFilter]);

    const handleTabClick = useCallback((tabKey) => {
         console.log("Complaints: Tab changed to", tabKey);
         setActiveTab(tabKey);
    }, []);

    const tabs = useMemo(() => [
        { key: 'tenants', label: 'От Арендаторов' },
        { key: 'landlords', label: 'От Арендодателей' },
    ], []);

    return (
        <div className="admin-complaints-page">
            <h2>Управление Жалобами</h2>
            <div className="complaint-controls">
                 <div className="complaint-tabs">
                    {tabs.map(tab => ( <button key={tab.key} onClick={() => handleTabClick(tab.key)} className={activeTab === tab.key ? 'active' : ''} disabled={loading}>{tab.label}</button> ))}
                </div>
                 <div className="status-filter">
                     <label htmlFor="status-select">Статус:</label>
                     <Select id="status-select" value={statusFilter} onChange={handleFilterChange} disabled={loading}>
                         {Object.entries(STATUS_FILTER_OPTIONS).map(([value, label]) => ( <option key={value} value={value}>{label}</option> ))}
                     </Select>
                 </div>
            </div>

            {loading && !loadingAction && <p>Загрузка жалоб...</p>}
            <AdminComplaintTable complaints={complaints} complaintType={activeTab} onStatusChange={handleStatusChange} loadingAction={loadingAction} />
            <AdminPagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} loading={loading} />
            {showErrorModal && error && (<AlertModal message={error} onClose={closeErrorModal} />)}
        </div>
    );
};

export default AdminComplaintsPage;