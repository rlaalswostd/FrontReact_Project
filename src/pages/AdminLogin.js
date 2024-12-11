import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import axios from 'axios';
import LogoImage from '../assets/images/port_repair.png'

function AdminLogin({ setIsAuthenticated, setUserRole }) {  // setIsAdmin 대신 setUserRole
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // 로그아웃 핸들
    const handlelogout = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post("http://localhost:8080/ROOT/api/admin/logout", null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(response.data);

            localStorage.removeItem("token");
            localStorage.removeItem("adminId");
            localStorage.removeItem("role");

            setIsAuthenticated(false);
            setUserRole(null);  // setIsAdmin 대신 setUserRole 사용

            alert("로그아웃 되었습니다.");
            navigate('/');
        } catch (error) {
            console.error("로그아웃 실패", error);
            alert("로그아웃 실패");
        }
    };

    // 로그인 핸들
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // 로그인 전에 기존 데이터 정리
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('adminId');

            const response = await axios.post('http://localhost:8080/ROOT/api/admin/login', {
                email: username,
                password: password
            });

            if (response.data.status === 'success') {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('adminId', response.data.data.adminId);
                localStorage.setItem('role', 'SUPER_ADMIN');

                //응답 데이터 확인용 로그
                console.log('Login response:', response.data);
                console.log('Stored adminId:', response.data.data.adminId);

                setIsAuthenticated(true);
                setUserRole('SUPER_ADMIN');  // setIsAdmin(true) 대신 setUserRole 사용

                navigate('/admin/users');
            } else {
                alert('로그인 실패!! 로그인 정보를 다시 확인해주세요');
            }
        } catch (error) {
            console.error('Login err:', error);
            alert(error.response?.data?.message || '로그인 중 오류 발생');
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="login-container admin-login">
            <div className="login-box">
                <img src={LogoImage} alt="Admin Logo" className="login-logo" />
                <h2>Admin 로그인</h2>
                <form onSubmit={handleLogin}>
                    <div className="login-font-color1">
                        <label>ID </label>
                        <input type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="login-font-color2">
                        <label>PW</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit">로그인</button>
                    <button type="button" onClick={handleBack}>돌아가기</button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;