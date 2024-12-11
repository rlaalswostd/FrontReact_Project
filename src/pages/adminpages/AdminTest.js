import React, { useState } from 'react';
import axios from 'axios';

const AdminTest = () => {
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
        <div>
            <h2>매장과 계약 생성</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>매장 ID:</label>
                    <input
                        type="text"
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>매장 이름:</label>
                    <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>주소:</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>전화번호:</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>활성 상태:</label>
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    />
                </div>
                <div>
                    <label>관리자 ID:</label>
                    <input
                        type="number"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>계약 시작일:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>계약 종료일:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>월 요금:</label>
                    <input
                        type="number"
                        value={monthlyFee}
                        onChange={(e) => setMonthlyFee(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>계약 상태:</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="EXPIRED">EXPIRED</option>
                    </select>
                </div>
                <button type="submit">매장과 계약 생성</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AdminTest;
