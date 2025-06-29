// src/router/AppRouter.jsx
import React, { Suspense, lazy} from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from '../layout/Layout';

import ProtectedAdminRoute from './ProtectedAdminRoute';

import AdminLayout from '../pages/admin/AdminLayout';

const AdminLoginPage = lazy(() => import('../pages/admin/admin-login/AdminLoginPage')); 
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminTenantsPage = lazy(() => import('../pages/admin/AdminTenantsPage'));
const AdminLandlordsPage = lazy(() => import('../pages/admin/AdminLandlordsPage'));
const AdminComplaintsPage = lazy(() => import('../pages/admin/admin-complaints/AdminComplaintsPage'));
const AdminChatPage = lazy(() => import('../pages/admin/admin-chat/AdminChatPage'));

const Home = lazy(() => import('../pages/home/Home'));
const About = lazy(() => import('../pages/about/About'));
const Favorites = lazy(() => import('../pages/favorites/Favorites'));
const Login = lazy(() => import('../pages/auth/login/Login'));
const Register = lazy(() => import('../pages/auth/register/Register'));
const House = lazy(() => import('../pages/House/House'));
const LandLord = lazy(() => import('../pages/landlord/Landlord'));
const NotFound = lazy(() => import('../pages/notfound/NotFound'));



export default function AppRouter() {
    return (
        <>
            <Suspense fallback={<div>Загрузка...</div>}>
                <Routes>
                    <Route path="/" element={<Layout><Home /></Layout>} />
                    <Route path="/about" element={<Layout><About /></Layout>} />
                    <Route path="/favorites" element={<Layout><Favorites /></Layout>} />
                    <Route path="/login" element={<Layout><Login /></Layout>} />
                    <Route path="/register" element={<Layout><Register /></Layout>} />
                    <Route path="/house/*" element={<Layout><House /></Layout>} />
                    <Route path="/landlord/*" element={<Layout><LandLord /></Layout>} />

                    <Route path="/admin/login" element={<AdminLoginPage />} />


                    <Route element={<ProtectedAdminRoute />}>

                        <Route path="/admin" element={<AdminLayout />}>

                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<AdminDashboardPage />} />
                            <Route path="tenants" element={<AdminTenantsPage />} />
                            <Route path="landlords" element={<AdminLandlordsPage />} />
                            <Route path="complaints" element={<AdminComplaintsPage />} />
                            <Route path="chat" element={<AdminChatPage />} />
                            <Route path="*" element={<Navigate to="dashboard" replace />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Layout><NotFound /></Layout>} />
                </Routes>
            </Suspense>

        </>
    );
}