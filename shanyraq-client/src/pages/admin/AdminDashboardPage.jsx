import React from 'react';

const AdminDashboardPage = () => {
    console.log('RENDERING: AdminDashboardPage'); // Добавим лог рендера
    return (
        <div style={{ border: '2px solid red', padding: '20px', margin: '20px' }}>
            <h1>ТЕСТ ДАШБОРДА</h1>
            <p>Если ты видишь это, компонент страницы рендерится.</p>
        </div>
    );
};

export default AdminDashboardPage;