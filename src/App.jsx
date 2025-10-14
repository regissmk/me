import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import ClientLayout from '@/layouts/ClientLayout';
import DashboardPage from '@/pages/admin/DashboardPage';
import ContractsPage from '@/pages/admin/ContractsPage';
import ContractDetailPage from '@/pages/admin/ContractDetailPage';
import HiresPage from '@/pages/admin/HiresPage';
import HireDetailPage from '@/pages/admin/HireDetailPage';
import ProductsPage from '@/pages/admin/ProductsPage';
import PlansPage from '@/pages/admin/PlansPage';
import GalleriesPage from '@/pages/admin/GalleriesPage';
import ClientsPage from '@/pages/admin/ClientsPage';
import CommunicationsPage from '@/pages/admin/CommunicationsPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import RegistrationPage from '@/pages/RegistrationPage';
import UsersPage from '@/pages/admin/UsersPage';
import SuppliersPage from '@/pages/admin/SuppliersPage';
import SupplierFormPage from '@/pages/admin/SupplierFormPage';
import AccountsPage from '@/pages/admin/AccountsPage';
import FinancialCategoriesPage from '@/pages/admin/FinancialCategoriesPage';
import SchedulingPage from '@/pages/admin/SchedulingPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import ClientProtectedRoute from '@/components/ClientProtectedRoute';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// Client Pages
import ClientDashboardPage from '@/pages/client/DashboardPage';
import ClientProfilePage from '@/pages/client/ProfilePage';
import ClientSettingsPage from '@/pages/client/SettingsPage';
import ClientGalleriesPage from '@/pages/client/GalleriesPage';
import ClientShopPage from '@/pages/client/ShopPage';
import ClientMyOrderPage from '@/pages/client/MyOrderPage';
import ClientFavoritePhotosPage from '@/pages/client/FavoritePhotosPage';
import ClientSchedulePage from '@/pages/client/SchedulePage';
import ClientHiresPage from '@/pages/client/HiresPage';
import ClientFinancialPage from '@/pages/client/FinancialPage';
import ClientDownloadContractPage from '@/pages/client/DownloadContractPage';


// Financial Module
import OrdersPage from '@/pages/admin/financial/OrdersPage';
import CashFlowPage from '@/pages/admin/financial/CashFlowPage';
import AccountsPayablePage from '@/pages/admin/financial/AccountsPayablePage';
import AccountsReceivablePage from '@/pages/admin/financial/AccountsReceivablePage';
import GatewayOperationsPage from '@/pages/admin/financial/GatewayOperationsPage';


function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // Or a loading spinner
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={user ? <Navigate to="/client/dashboard" /> : <ClientLoginPage />} />
            <Route path="/login" element={<ClientLoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />
            <Route path="/cadastro/:contractSlug" element={<RegistrationPage />} />

            {/* Client Protected Routes */}
            <Route 
                path="/client" 
                element={
                    <ClientProtectedRoute>
                        <ClientLayout />
                    </ClientProtectedRoute>
                }
            >
                <Route index element={<ClientDashboardPage />} />
                <Route path="dashboard" element={<ClientDashboardPage />} />
                <Route path="profile" element={<ClientProfilePage />} />
                <Route path="settings" element={<ClientSettingsPage />} />
                <Route path="galleries" element={<ClientGalleriesPage />} />
                <Route path="shop" element={<ClientShopPage />} />
                <Route path="my-order" element={<ClientMyOrderPage />} />
                <Route path="favorite-photos" element={<ClientFavoritePhotosPage />} />
                <Route path="schedule" element={<ClientSchedulePage />} />
                <Route path="hires" element={<ClientHiresPage />} />
                <Route path="financial" element={<ClientFinancialPage />} />
                <Route path="download-contract" element={<ClientDownloadContractPage />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route 
                path="/admin" 
                element={
                    <ProtectedRoute>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardPage />} />
                <Route path="contracts" element={<ContractsPage />} />
                <Route path="contracts/:contractId" element={<ContractDetailPage />} />
                <Route path="hires" element={<HiresPage />} />
                <Route path="hires/:hireId" element={<HireDetailPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="plans" element={<PlansPage />} />
                <Route path="galleries" element={<GalleriesPage />} />
                <Route path="scheduling" element={<SchedulingPage />} />
                <Route path="communications" element={<CommunicationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                
                {/* Cadastros */}
                <Route path="users" element={<UsersPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="suppliers" element={<SuppliersPage />} />
                <Route path="suppliers/new" element={<SupplierFormPage />} />
                <Route path="suppliers/edit/:supplierId" element={<SupplierFormPage />} />
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="financial-categories" element={<FinancialCategoriesPage />} />

                {/* Financeiro */}
                <Route path="financial/orders" element={<OrdersPage />} />
                <Route path="financial/cash-flow" element={<CashFlowPage />} />
                <Route path="financial/accounts-payable" element={<AccountsPayablePage />} />
                <Route path="financial/accounts-receivable" element={<AccountsReceivablePage />} />
                <Route path="financial/gateway-operations" element={<GatewayOperationsPage />} />

                {/* Deprecated - to be removed */}
                <Route path="order-items" element={<Navigate to="/admin/financial/orders" replace />} />

            </Route>
        </Routes>
    );
}

export default App;