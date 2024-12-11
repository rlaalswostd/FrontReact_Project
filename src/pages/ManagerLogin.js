import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImage from '../assets/images/port_repair.png';
import './Login.css';

function ManagerLogin({ setIsAuthenticated, setUserRole }) {
    const title = "[반가워요 사장님]";
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [stores, setStores] = useState([]);
    const [selectedStoreId, setSelectedStoreId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);  // 로그인 성공 상태 추가
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 기존 데이터 정리
            localStorage.clear();  // 모든 저장된 데이터 초기화

            // 1. 로그인 요청
            const loginResponse = await axios.post(
                'http://localhost:8080/ROOT/api/admin/manager-login',
                {
                    email: username,
                    password: password
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            if (loginResponse.data.status === 'success') {
                const { token, data } = loginResponse.data;
                const adminId = data.adminId;

                // 기본 정보 저장
                localStorage.setItem('token', token);
                localStorage.setItem('role', 'STORE_ADMIN');
                localStorage.setItem('adminId', adminId);

                // 2. 매장 정보 요청
                try {
                    const storeResponse = await axios.get(
                        `http://localhost:8080/ROOT/api/store/stores/${adminId}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    console.log('Store Response:', storeResponse.data); // 응답 데이터 확인

                    if (storeResponse.data.status === 'success' && storeResponse.data.data && Array.isArray(storeResponse.data.data)) {
                        setStores(storeResponse.data.data);
                        setLoginSuccess(true);  // 로그인 성공 상태 설정
                        setIsAuthenticated(true);
                        setUserRole('STORE_ADMIN');
                    } else {
                        throw new Error('매장 데이터 형식이 올바르지 않습니다.');
                    }
                } catch (storeError) {
                    console.error('Store fetch error:', storeError);
                    alert('매장 정보를 불러오는데 실패했습니다.');
                }
            } else {
                alert('로그인 실패');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert(error.response?.data?.message || '로그인 중 오류 발생');
        } finally {
            setLoading(false);
        }
    };


    //리액트 홈화면 storeid별 (현재 주문내역 확인)
    const handleStoreSelect = (storeId, storeName) => {
        setSelectedStoreId(storeId);
        localStorage.setItem('storeId', storeId);
        localStorage.setItem('storeName', storeName); // 매장 이름도 저장
        navigate(`/manager/orders/${storeId}`);
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="login-container manager-login">
            <div className="login-box">
                <img src={LogoImage} alt="Admin Logo" className="login-logo" />

                {!loginSuccess ? (
                    // 로그인 폼
                    <>
                        <h2>{title}</h2>
                        <h2>로그인을 해주세요</h2>
                        <form className='manager-login-form' onSubmit={handleLogin}>
                            <div className="login-font-color1">
                                <label>아 이 디 </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="login-font-color2">
                                <label>비밀번호</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <button type="submit" disabled={loading}>
                                {loading ? '로그인 중...' : '로그인'}
                            </button>
                            <button type="button" onClick={handleBack} disabled={loading}>
                                돌아가기
                            </button>
                        </form>
                    </>
                ) : (
                    // 매장 선택 UI
                    <div className="store-selection">
                        <div className='store-sel-title'>관리할 "매장"을 선택해주세요</div>
                        {stores.length > 0 ? (
                            <div className="store-list">
                                {stores.map((store) => (
                                    <div key={store.storeId}>
                                        <button
                                            className={`store-button ${selectedStoreId === store.storeId ? 'selected' : ''}`}
                                            onClick={() => handleStoreSelect(store.storeId, store.storeName)}
                                        >
                                            <div className="store-info">
                                                <div className="store-name">{store.storeName}</div>
                                                {/* <span className="store-address">{store.address}</span> */}
                                            </div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>등록된 매장이 없습니다.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManagerLogin;