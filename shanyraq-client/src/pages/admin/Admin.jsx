import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from './AdminLayout';

const AdminDashboardPage = lazy(() => import('./AdminDashboardPage'));

const AdminTenantsPage = lazy(() => import('./AdminTenantsPage'));
const AdminLandlordsPage = lazy(() => import('./AdminLandlordsPage'));
const AdminComplaintsPage = lazy(() => import('./admin-complaints/AdminComplaintsPage'));
const AdminChatPage = lazy(() => import('./admin-chat/AdminChatPage'));
// const AdminNotFoundPage = lazy(() => import('./AdminNotFoundPage')); 

export default function Admin() {
  console.log('RENDERING: Admin component (contains Routes)');
    return (
        <AdminLayout>
            <Suspense fallback={<div>Загрузка раздела админки...</div>}>
                <Routes>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<div>СТРАНИЦА ДАШБОРДА (ТЕКСТ)</div>} />
                    <Route path="tenants" element={<AdminTenantsPage />} />
                    <Route path="landlords" element={<AdminLandlordsPage />} />
                    <Route path="complaints" element={<AdminComplaintsPage />} />
                    <Route path="chat" element={<AdminChatPage />} />

                    {/* <Route path="*" element={<AdminNotFoundPage />} /> */}
                </Routes>
            </Suspense>
        </AdminLayout>
    );
}