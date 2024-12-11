import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
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
        <AuthContext.Provider value={{ isAuthenticated, userRole, setIsAuthenticated, setUserRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
