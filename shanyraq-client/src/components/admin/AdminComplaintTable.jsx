import React from 'react';
import Select from '../UI/select/Select';
import './AdminComplaintTable.scss';

const STATUS_OPTIONS = {
    active: 'Активна',
    'in processing': 'В обработке',
    inactive: 'Закрыта',
};

const AdminComplaintTable = ({ complaints = [], complaintType, onStatusChange, loadingAction }) => {

    const handleStatusChange = (complaintId, newStatus) => {
        if (onStatusChange) {
            onStatusChange(complaintId, complaintType, newStatus);
        }
    };

    if (!complaints || complaints.length === 0) {
        return <p>Жалобы не найдены.</p>;
    }

    return (
        <table className="admin-complaint-table">
            <thead>
                <tr>
                    <th>ID Жалобы</th>
                    <th>Автор</th>
                    <th>Тип/Объект</th>
                    <th>Комментарий</th>
                    <th>Статус</th>
                    <th>Дата</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                {complaints.map((complaint, index) => (
                    <tr key={complaint._id} style={{ '--index': index }}>
                        <td data-label="ID">{complaint._id}</td>
                        <td data-label="Автор">{complaint.authorInfo?.email || complaint.authorEmail || 'N/A'}</td>
                        <td data-label="Тип/Объект">
                            {complaintType === 'tenants' && (
                                <><span>Тип: {complaint.complaintType}</span><br /><span>ID объекта: {complaint.objectId || 'N/A'}</span></>
                            )}
                            {complaintType === 'landlords' && (
                                <><span>На кого: {complaint.targetTenantInfo?.email || 'N/A'}</span><br /><span>Причина: {complaint.complaintFor || 'N/A'}</span></>
                            )}
                        </td>
                        <td data-label="Комментарий">{complaint.comment || '-'}</td>
                        <td data-label="Статус">{STATUS_OPTIONS[complaint.status] || complaint.status}</td>
                        <td data-label="Дата">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                        <td data-label="Действия">
                            <Select
                                value={complaint.status}
                                onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                                disabled={loadingAction === complaint._id || complaint.status === 'inactive'}
                            >
                                <option key={complaint.status} value={complaint.status} disabled>{STATUS_OPTIONS[complaint.status] || complaint.status}</option>
                                {Object.entries(STATUS_OPTIONS).map(([value, label]) => (
                                    value !== complaint.status && value !== 'active' && (
                                        <option key={value} value={value}>{label}</option>
                                    )
                                ))}
                            </Select>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default AdminComplaintTable;