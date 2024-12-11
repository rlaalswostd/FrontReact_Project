import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './AdminApp.css';
import AdminSidebar from './components/AdminSidebar';
import AdminContract from './pages/adminpages/AdminContract';
import AdminNotice from './pages/adminpages/AdminNotice';
import AdminRegister from './pages/adminpages/AdminRegister';
import AdminSettings from './pages/adminpages/AdminSettings';
import AdminShop from './pages/adminpages/AdminShop';
import AdminUsers from './pages/adminpages/AdminUsers';

function AdminApp() {
    const [isAuthenticated, setIsAuthenticated] = useState(true); // 로그인 상태 유지

    return (
        <div className="Adminapp"> {/* 클래스명 적용 */}
            {isAuthenticated && <AdminSidebar setIsAuthenticated={setIsAuthenticated}/>}
            <div className="Admincontent">
                <Routes>
                    <Route path="/users" element={isAuthenticated ? <AdminUsers /> : <Navigate to="/admin-login" />} />
                    <Route path="/settings" element={isAuthenticated ? <AdminSettings /> : <Navigate to="/admin-login" />} />
                    <Route path="/notice" element={isAuthenticated ? <AdminNotice /> : <Navigate to="/admin-login" />} />
                    <Route path="/Register" element={isAuthenticated ? <AdminRegister /> : <Navigate to="/admin-login" />} />
                    <Route path="/contract" element={isAuthenticated ? <AdminContract /> : <Navigate to="/admin-login" />} />
                    <Route path="/shop" element={isAuthenticated ? <AdminShop /> : <Navigate to="/admin-login" />} />
                </Routes>
            </div>
        </div>
    );
}

export default AdminApp;
