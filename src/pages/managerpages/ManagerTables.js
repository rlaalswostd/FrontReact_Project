import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './ManagerTables.css';

const ManagerTables = () => {
    const { storeId } = useParams(); // URL에서 storeId를 가져옴
    const [tableNumber, setTableNumber] = useState(''); // 테이블 번호 상태
    const [isOccupied, setIsOccupied] = useState(false); // 점유 상태
    const [message, setMessage] = useState(''); // 사용자 메시지
    const [loading, setLoading] = useState(false); // 로딩 상태
    const navigate = useNavigate();
    const [storeName, setStoreName] = useState('');

    const API_BASE_URL = 'http://localhost:8080/ROOT';

    // 페이지가 로드될 때 현재 URL을 localStorage에 저장
    useEffect(() => {
        // 현재 페이지의 URL을 localStorage에 저장하되, /Errorpage11 페이지는 제외
        if (window.location.pathname !== '/Errorpage11') {
            // 기존 경로 배열 가져오기 (없으면 빈 배열)
            const lastValidPaths = JSON.parse(localStorage.getItem('lastValidPaths')) || [];

            // 새로운 경로를 배열에 추가 (중복 방지)
            if (lastValidPaths[lastValidPaths.length - 1] !== window.location.pathname) {
                lastValidPaths.push(window.location.pathname);
            }

            // 배열을 localStorage에 저장
            localStorage.setItem('lastValidPaths', JSON.stringify(lastValidPaths));
        }
    }, []);

    useEffect(() => {
        const savedStoreId = localStorage.getItem('storeId');  // 로그인한 매장의 storeId
        const savedStoreName = localStorage.getItem('storeName');

        // URL의 storeId와 localStorage의 storeId가 다른 경우 처리
        if (storeId && savedStoreId !== storeId) {

            // 로그인 페이지로 리디렉션
            navigate('/Errorpage11');
            return;  // 더 이상 코드 실행하지 않음
        }

        if (savedStoreName) {
            setStoreName(savedStoreName);
        }
    }, [storeId, navigate]);  // storeId와 navigate 의존성 배열에 추가

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');


        // 유효성 검사
        if (!tableNumber.trim()) {
            setMessage('테이블 번호를 입력해주세요.');
            setLoading(false);
            return;
        }

        // 서버로 전송할 데이터
        const tableData = {
            tableNumber: tableNumber.trim(),
            isOccupied: isOccupied,
            store: { storeId: storeId }, // 테이블과 store를 연결
        };

        try {
            // POST 요청
            const response = await axios.post(
                `${API_BASE_URL}/api/tables/insert.do`,
                tableData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );

            if (response.data.status === 'success') {
                // 성공 처리
                setMessage('테이블이 성공적으로 등록되었습니다!');
                setTableNumber(''); // 입력 필드 초기화
                setIsOccupied(false); // 기본 상태로 초기화
            } else if (response.data.status === 'conflict') {
                // 중복 테이블 번호 처리
                setMessage(`중복된 테이블 번호입니다. (${response.data.message})`);
            } else {
                // 기타 오류 메시지
                setMessage(`오류: ${response.data.message}`);
            }
        } catch (error) {
            // 요청 처리 실패
            console.error('Error:', error);
            setMessage(
                error.response?.data?.message ||
                '요청 처리 중 오류가 발생했습니다.'
            );
        } finally {
            setLoading(false); // 로딩 상태 해제
        }
    };

    // 테이블 번호에 숫자만 입력할 수 있도록 하고 음수는 제외
    const handleTableNumberChange = (e) => {
        const value = e.target.value;
        // 숫자만 허용하고, 음수는 제외
        if (/^\d*$/.test(value)) {
            setTableNumber(value);
        }
    };

    return (
        <div className="manager-tables-container">
            <div className="mt-header">테이블 등록</div>
            <form onSubmit={handleSubmit} className="mt-form">
                {/* 테이블 번호 입력 */}
                <div className="mt-form-group">
                    <label className="mt-label">테이블 번호</label>
                    <input type="text"
                        className="mt-input"
                        value={tableNumber}
                         onChange={handleTableNumberChange} // 숫자만 입력하도록 처리
                        placeholder="테이블 번호를 입력하세요"
                        required />
                </div>

                {/* 매장 ID (읽기 전용) */}
                <div className="mt-form-group">
                    <label className="mt-label">매장 ID</label>
                    <input type="text"
                        className="mt-input"
                        value={storeId}
                        readOnly
                        disabled />
                </div>

                {/* 점유 상태 선택 */}
                <div className="mt-form-group">
                    <label className="mt-label">테이블 상태</label>
                    <select className="mt-input2"
                        value={isOccupied}
                        onChange={(e) => setIsOccupied(e.target.value === 'true')}                    >
                        <option value="false">사용 안함</option>
                        <option value="true">사용 중</option>
                    </select>
                </div>

                {/* 등록 버튼 */}
                <button
                    type="submit"
                    className="mt-button"
                    disabled={loading}
                >
                    {loading ? '등록 중...' : '테이블 등록'}
                </button>
            </form>

            {/* 결과 메시지 */}
            {message && (
                <p className={`mt-message ${message.includes('성공') ? 'success' : 'error'}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default ManagerTables;
