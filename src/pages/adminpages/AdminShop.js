import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminShop.css';

const AdminShop = () => {
    const [storeId, setStoreId] = useState('');
    const [storeName, setStoreName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [adminId, setAdminId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [monthlyFee, setMonthlyFee] = useState('');
    const [status, setStatus] = useState('EXPIRED');
    const [message, setMessage] = useState('');

    const API_BASE_URL = 'http://localhost:8080/ROOT';

    // 오늘 날짜를 기본값으로 설정
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD' 형식으로 변환
        setStartDate(today);
    }, []);

    // 폼 제출 시 호출되는 함수
    const handleSubmit = async (e) => {
        e.preventDefault();

        const requestData = {
            data: {
                storeId,
                storeName,
                address,
                phone,
                isActive,
                adminId: parseInt(adminId),
                startDate,
                endDate,
                monthlyFee: parseInt(monthlyFee),
                status
            }
        };

        try {
            const response = await axios.post(`${API_BASE_URL}/api/contract/insertWithStore.do`, requestData);

            if (response.data.status === 'success') {
                setMessage('매장과 계약이 성공적으로 생성되었습니다.');
            } else {
                setMessage(`에러: ${response.data.message}`);
            }
        } catch (error) {
            setMessage('서버와의 연결에 실패했습니다.');
        }
    };

    return (
        <div className="admin-shop-container">
            <div className="admin-shop-title">* 매장과 계약 생성 *</div>
            <form className="admin-shop-form" onSubmit={handleSubmit}>
                <div className="admin-shop-field">
                    <label>매장번호 : </label>
                    <input
                        type="text"
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                        required
                    />
                </div>
                <div className="admin-shop-field">
                    <label>매장 이름:</label>
                    <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        required
                    />
                </div>
                <div className="admin-shop-field">
                    <label>주소:</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </div>
                <div className="admin-shop-field">
                    <label>전화번호:</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>
                <div className="admin-shop-field">
                    <label>회원 ID:</label>
                    <input
                        type="number"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        required
                    />
                </div>
                <div className="admin-shop-field">
                    <label>계약 시작일:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                </div>
                <div className="admin-shop-field">
                    <label>계약 종료일:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                </div>
                <div className="admin-shop-field">
                    <label>월 요금:</label>
                    <input
                        type="number"
                        value={monthlyFee}
                        onChange={(e) => setMonthlyFee(e.target.value)}
                        required
                    />
                </div>
                <div className="admin-shop-field">
                    <label>계약 상태:</label>
                    <select className='admin-shop-field-select'
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="EXPIRED">EXPIRED</option>
                    </select>
                </div>
                <div className="admin-shop-field-checkbox">
                    <label className='checkbox-name'>활성 상태 :</label>
                    <input className='checkbox-width'
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    />
                </div>
                <button className="admin-shop-button" type="submit">
                    매장과 계약 생성
                </button>
            </form>
            {message && <p className="admin-shop-message">{message}</p>}
        </div>
    );
};

export default AdminShop;
