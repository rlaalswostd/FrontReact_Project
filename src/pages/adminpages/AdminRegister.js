import axios from 'axios'; // axios import 추가
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImage from '../../assets/images/port_repair.png';
import './AdminRegister.css';

function ManagerRegister() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [adminName, setAdminName] = useState(''); 
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            // 로컬 스토리지에서 관리자 토큰 가져오기
            const token = localStorage.getItem('token');
            if (!token) {
                alert('관리자 로그인이 필요합니다.');
                navigate('/admin-login');
                return;
            }

            const response = await axios.post(
                'http://localhost:8080/ROOT/api/admin/adminregister',
                {
                    email: username,        // 사장님 이메일
                    password: password,     // 사장님 비밀번호
                    adminName: adminName    // 사장님 이름
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`  // 관리자 토큰
                    }
                }
            );

            if (response.data.status === 'success') {
                alert('사장님 계정이 성공적으로 생성되었습니다.');
                navigate('/admin/users');
            } else {
                alert(response.data.message || '계정 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert(error.response?.data?.message || '계정 생성 중 오류가 발생했습니다.');
        }
    };

    const handleBackToLogin = () => {
        navigate('/admin');
    };

    return (
        <div className="manager-register login-container">
            <div className="login-box">
                <img src={LogoImage} alt="Admin Logo" className="login-logo" />
                <h2>사장님 계정등록</h2>
                <form className='register-form' onSubmit={handleRegister}>
                    <div>
                        <label>아이디(이메일)</label>
                        <input
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>사장님 이름</label>
                        <input
                            type="text"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                        />
                    </div>
                    <button type="submit">회원가입</button>
                    <button type="button" onClick={() => navigate('/admin/users')}>돌아가기</button>
                </form>
            </div>
        </div>
    );
}

export default ManagerRegister;