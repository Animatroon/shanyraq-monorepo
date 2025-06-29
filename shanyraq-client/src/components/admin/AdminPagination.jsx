import React from 'react';
import Button from '../UI/button/Button';
import './AdminPagination.scss';

const AdminPagination = ({ currentPage, totalPages, onPageChange, loading }) => {
    if (!totalPages || totalPages <= 1) {
        return null;
    }

    const handlePrevious = () => {
        if (currentPage > 1 && onPageChange && typeof onPageChange === 'function') {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages && onPageChange && typeof onPageChange === 'function') {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="admin-pagination">
            <Button
                text="< Назад"
                onClick={handlePrevious}
                disabled={currentPage === 1 || loading}
                className="pagination-button prev"
            />
            <span className="pagination-info">
                Страница {currentPage} из {totalPages}
            </span>
            <Button
                text="Вперед >"
                onClick={handleNext}
                disabled={currentPage === totalPages || loading}
                className="pagination-button next"
            />
        </div>
    );
};

export default AdminPagination;