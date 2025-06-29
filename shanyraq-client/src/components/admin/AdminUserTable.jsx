import React, { useState } from 'react';
import Button from '../UI/button/Button';
import AlertModal from '../UI/alert-modal/AlertModal';
import Input from '../UI/input/Input';
import './AdminUserTable.scss';

const AdminUserTable = ({ users = [], userType, onToggleBlacklist, loadingAction }) => {
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [reason, setReason] = useState('');
    const [userToBlacklist, setUserToBlacklist] = useState(null);

    const handleToggleClick = (userId, isBlacklisted) => {
        if (isBlacklisted) {
            if (onToggleBlacklist) {
                onToggleBlacklist(userId, userType, true, undefined);
            }
        } else {
            setUserToBlacklist({ userId, isBlacklisted });
            setShowReasonModal(true);
        }
    };

    const handleConfirmBlacklist = () => {
        if (userToBlacklist && onToggleBlacklist) {
            onToggleBlacklist(userToBlacklist.userId, userType, false, reason || 'Причина не указана');
        }
        closeReasonModal();
    };

    const closeReasonModal = () => {
        setShowReasonModal(false);
        setReason('');
        setUserToBlacklist(null);
    };

    if (!users || users.length === 0) {
        return <p>Пользователи не найдены.</p>;
    }

    return (
        <>
            <table className="admin-user-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Телефон</th>
                        <th>ИИН</th>
                        <th>Статус</th>
                        <th>Причина бана</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user._id} className={user.isBlacklisted ? 'blacklisted' : ''} style={{ '--index': index }}>
                            <td data-label="ID">{user._id}</td>
                            <td data-label="Имя">{`${user.lastName || ''} ${user.firstName || ''} ${user.fatherName || ''}`.trim() || '-'}</td>
                            <td data-label="Email">{user.email || '-'}</td>
                            <td data-label="Телефон">{user.phone || '-'}</td>
                            <td data-label="ИИН">{user.iin || '-'}</td>
                            <td data-label="Статус">
                                {user.isBlacklisted
                                    ? <span className="status-blacklisted">Заблокирован</span>
                                    : <span className="status-active">Активен</span>
                                }
                            </td>
                             <td data-label="Причина бана">{user.isBlacklisted ? (user.blacklistReason || 'Не указана') : '-'}</td>
                            <td data-label="Действия">
                                <Button
                                    text={user.isBlacklisted ? 'Разблок.' : 'Заблок.'}
                                    onClick={() => handleToggleClick(user._id, user.isBlacklisted)}
                                    disabled={loadingAction === user._id}
                                    className={`action-button ${user.isBlacklisted ? 'unban' : 'ban'}`}
                                    title={user.isBlacklisted ? 'Разблокировать пользователя' : 'Заблокировать пользователя'}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showReasonModal && (
                 <AlertModal message="" onClose={closeReasonModal}>
                    <div className="reason-prompt">
                         <h4>Укажите причину блокировки</h4>
                         <Input
                             value={reason}
                             onChange={(e) => setReason(e.target.value)}
                             placeholder="Причина блокировки (опционально)"
                             autoFocus
                         />
                         <div className="reason-prompt-actions">
                             <Button text="Отмена" onClick={closeReasonModal} className="cancel-btn"/>
                             <Button text="Заблокировать" onClick={handleConfirmBlacklist} className="confirm-btn"/>
                         </div>
                    </div>
                </AlertModal>
            )}
        </>
    );
};

export default AdminUserTable;