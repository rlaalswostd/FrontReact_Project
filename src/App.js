import 'font-awesome/css/font-awesome.min.css';
import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminApp from './AdminApp';
import ManagerSidebar from './components/ManagerSidebar';
import ManagerApp from './ManagerApp';
import AdminLogin from './pages/AdminLogin';
import InitialLogin from './pages/InitialLogin';
import ManagerLogin from './pages/ManagerLogin';
import Errorpage11 from './pages/managerpages/Errorpage11'; // 추가: Errorpage11 컴포넌트 임포트



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    return Boolean(token);
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('role');
  });

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    setIsAuthenticated(!!token);
    setUserRole(role);
  };

  useEffect(() => {
    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<InitialLogin />} />
        <Route
          path="/admin-login"
          element={
            <AdminLogin
              setIsAuthenticated={setIsAuthenticated}
              setUserRole={setUserRole}
            />
          }
        />
        <Route
          path="/manager-login"
          element={
            <ManagerLogin
              setIsAuthenticated={setIsAuthenticated}
              setUserRole={setUserRole}
            />
          }
        />

        <Route
          path="/admin/*"
          element={
            isAuthenticated && userRole === 'SUPER_ADMIN' ? (
              <AdminApp />
            ) : (
              <Navigate to="/admin-login" />
            )
          }
        />

        {/* 매니저 관련 모든 라우트를 하나로 통합 */}
        <Route
          path="/manager/*"
          element={
            isAuthenticated && userRole === 'STORE_ADMIN' ? (
              <div className="Managerapp">
                <ManagerSidebar setIsAuthenticated={setIsAuthenticated} />
                <div className="Managercontent">
                  <Routes>
                    <Route path="/" element={<Navigate to="notice" />} />
                    <Route path="*" element={<ManagerApp />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/manager-login" />
            )
          }

        />
        {/* ErrorPage11 라우트 추가 */}
        <Route path="/Errorpage11" element={<Errorpage11 />} />  {/* 추가된 경로 */}
      </Routes>
    </Router>

  );
}

export default App;