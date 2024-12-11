import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ManageCategoryNew = () => {  // 컴포넌트 이름 변경
    const { storeId } = useParams();
    const [cname, setCname] = useState('');
    const [displayOrder, setDisplayOrder] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [storeName, setStoreName] = useState('');


    const API_BASE_URL = 'http://localhost:8080/ROOT';


    /// 페이지가 로드될 때 현재 URL을 localStorage에 저장
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

    const [usedDisplayOrders, setUsedDisplayOrders] = useState([]); // 빈 배열로 초기화


    // 현재 등록 되어있는 표시순서 목록
    useEffect(() => {
        const fetchDisplayOrders = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/api/category/${storeId}/displayOrders`,
                    {
                        withCredentials: true,
                    }
                );
                if (response.data.status === 200) {
                    setUsedDisplayOrders(response.data.data); // "data"를 사용
                } else {
                    setMessage(`오류: ${response.data.message}`);
                }
            } catch (error) {
                console.error('Error fetching display orders:', error);
                setMessage('표시 순서 데이터를 가져오는 중 오류가 발생했습니다.');
            }
        };

        if (storeId) {
            fetchDisplayOrders();
        }
    }, [storeId]);


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


    useEffect(() => {
        if (storeId) {
            localStorage.setItem('storeId', storeId);
        }
    }, [storeId]);

    // 카테고리 등록 시 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!cname.trim() || !displayOrder) {
            setMessage('모든 필드를 입력해주세요.');
            setLoading(false);
            return;
        }

        const categoryData = {
            cname: cname.trim(),
            displayOrder: parseInt(displayOrder)
        };

        try {
            console.log('Sending request to server...');
            const response = await axios.post(
                `${API_BASE_URL}/api/category/store/${storeId}/register`,
                categoryData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );

            console.log('Server response:', response.data);

            if (response.data.status === 200) {
                setMessage('카테고리가 성공적으로 등록되었습니다!');
                setCname('');  // 카테고리 이름 초기화
                setDisplayOrder('');  // 표시 순서 초기화

                // 새로 등록된 카테고리 순서를 usedDisplayOrders에 추가
                setUsedDisplayOrders((prevOrders) => [...prevOrders, displayOrder]);
            } else {
                setMessage(`오류 : ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error details:', error);
            setMessage(
                error.response?.data?.message ||
                '요청 처리 중 오류가 발생했습니다.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='MCN-container'>
            <div className='MCN-main'>카테고리 등록</div>

            <form onSubmit={handleSubmit} className="MCN-form">
                <div className='MCN-form-group'>
                    <label className="MCN-label">카테고리 이름</label>
                    <input
                        className='MCN-input'
                        type="text"
                        value={cname}
                        onChange={(e) => setCname(e.target.value)}
                        placeholder="카테고리 이름을 입력하세요"
                        required
                    />
                </div>

                <div className="MCN-form-group">
                    <label className="MCN-label">현재 매장 번호</label>
                    <input
                        className="MCN-input"
                        type="text"
                        value={storeId}
                        readOnly
                        disabled
                    />
                </div>

                {usedDisplayOrders && usedDisplayOrders.length > 0 ? (
                    <div className="MCN-display-orders">
                        <p>현재 사용 중인 카테고리 순서</p>
                        <ul className="display-orders-list">
                            {usedDisplayOrders.map((order) => (
                                <li key={order} className="display-order-item">
                                    {order}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p>데이터를 로드 중입니다...</p>
                )}

                <br />

                <div className="MCN-form-group">
                    <label className="MCN-label">표시 순서</label>
                    <input
                        className="MCN-input"
                        type="number"
                        min="1"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(e.target.value)}
                        placeholder="표시 순서를 입력하세요"
                        required
                    />

                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="MCN-button"
                >
                    {loading ? '등록 중...' : '카테고리 등록'}
                </button>
            </form>

            {message && (
                <p className={`MCN-message ${message.includes('성공') ? 'success' : 'error'
                    }`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default ManageCategoryNew;  // export 이름도 변경