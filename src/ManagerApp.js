import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './ManagerApp.css';
import Errorpage11 from './pages/managerpages/Errorpage11';
import ManagerCategory from './pages/managerpages/ManagerCategory';
import ManagerCategoryNew from './pages/managerpages/ManagerCategoryNew';
import ManagerMenu from './pages/managerpages/ManagerMenu';
import ManagerMenuNew from './pages/managerpages/ManagerMenuNew';
import ManagerNotice from './pages/managerpages/ManagerNotice';
import ManagerOrders from './pages/managerpages/ManagerOrders';
import ManagerSettings from './pages/managerpages/ManagerSettings';
import StoreSelector from './pages/managerpages/ManagerStore';
import ManagerTables from './pages/managerpages/ManagerTables';
import ManagerTablesPut from './pages/managerpages/ManagerTablesPut';

function ManagerApp() {
    const [storeId, setStoreId] = useState(null);
    const navigate = useNavigate();

    const handleStoreSelect = (selectedStoreId) => {
        setStoreId(selectedStoreId);
        localStorage.setItem('storeId', selectedStoreId);
        navigate(`notice/${selectedStoreId}`);
    };

    return (
        <Routes>
            <Route path="notice/:storeId" element={<ManagerNotice />} />
            <Route path="categorynew/:storeId" element={<ManagerCategoryNew />} />
            <Route path="menunew/:storeId" element={<ManagerMenuNew />} />
            <Route path="menu/:storeId" element={<ManagerMenu />} />
            <Route path="orders/:storeId" element={<ManagerOrders />} />
            <Route path="settings/:storeId" element={<ManagerSettings />} />
            <Route path="category/:storeId" element={<ManagerCategory />} />
            <Route path="tables/:storeId" element={<ManagerTables />} />
            <Route path="tablesput/:storeId" element={<ManagerTablesPut />} />

            {/* Store Selector Route */}
            <Route
                path="admin/:adminId/select-store"
                element={<StoreSelector onStoreSelect={handleStoreSelect} />}
            />

            {/* 에러 페이지 */}
            <Route path="errorpage11" element={<Errorpage11 />} />

            {/* 잘못된 경로로 접근한 경우 에러 페이지로 리디렉션 */}
            <Route path="*" element={<Errorpage11 />} />



            <Route path="admin/:adminId/select-store" element={<StoreSelector onStoreSelect={handleStoreSelect} />} />
        </Routes>
    );
}

export default ManagerApp;