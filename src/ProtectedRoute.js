// src/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './AuthContext'; // 인증 상태를 관리하는 컨텍스트 예시

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext); // 로그인 여부 확인

    
    // 인증되지 않은 경우 로그인 페이지로 리디렉션
    if (!isAuthenticated) {
        return <Navigate to="/manager-login" replace />;
    }

    // 인증된 경우 보호된 페이지로 접근 허용
    return children;
};

export default ProtectedRoute;
