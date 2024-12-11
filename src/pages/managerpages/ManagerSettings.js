import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ManagerSettings.css'; // CSS 파일을 import

function ManagerSetting() {
    const { storeId } = useParams();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]); // 필터링된 데이터
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [storeName, setStoreName] = useState('');
    const [startDate, setStartDate] = useState(''); // 조회 시작 날짜
    const [endDate, setEndDate] = useState(''); // 조회 종료 날짜

    useEffect(() => {
        if (window.location.pathname !== '/Errorpage11') {
            const lastValidPaths = JSON.parse(localStorage.getItem('lastValidPaths')) || [];
            if (lastValidPaths[lastValidPaths.length - 1] !== window.location.pathname) {
                lastValidPaths.push(window.location.pathname);
            }
            localStorage.setItem('lastValidPaths', JSON.stringify(lastValidPaths));
        }
    }, []);

    useEffect(() => {
        const savedStoreId = localStorage.getItem('storeId');
        const savedStoreName = localStorage.getItem('storeName');

        if (storeId && savedStoreId !== storeId) {
            navigate('/Errorpage11');
            return;
        }

        if (savedStoreName) {
            setStoreName(savedStoreName);
        }
    }, [storeId, navigate]);

    useEffect(() => {
        fetchOrders();
    }, [storeId, page, pageSize]); // page와 pageSize를 의존성 배열에 추가

    useEffect(() => {
        // 필터링된 데이터에 대해 페이지네이션 처리
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        setFilteredOrders(orders);

        console.log("Current Page:", page);
        console.log("Page Size:", pageSize);
        console.log("Total Pages:", totalPages);
        console.log("Orders Count:", orders.length);
    }, [page, pageSize, orders]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(
                `http://127.0.0.1:8080/ROOT/api/orders/payment/history/${storeId}`,
                {
                    params: {
                        page: page, // 현재 페이지로 데이터를 가져옵니다.
                        size: pageSize // 현재 페이지 크기
                    }
                }
            );

            const currentDate = new Date(); // 현재 시간
            const fortyDaysAgo  = new Date();
            fortyDaysAgo.setDate(currentDate.getDate() - 30); // 몇일전 시간 계산할지.
            
            // 서버에서 받은 데이터의 'content'를 필터링하고 null값 처리
        const validOrders = response.data.content.filter((order) => {
            const orderDate = order.payment_time ? new Date(order.payment_time) : null;
            return orderDate && orderDate >= fortyDaysAgo; // payment_time이 null인 주문은 제외
        });

        setOrders(validOrders); // 전체 데이터 저장
        setTotalPages(response.data.totalPages); // 총 페이지 수 저장

        // 조회 날짜 범위 설정
        const formattedStartDate = fortyDaysAgo.toLocaleDateString('en-CA'); // YYYY-MM-DD 형식으로
        const formattedEndDate = currentDate.toLocaleDateString('en-CA'); // YYYY-MM-DD 형식으로
        setStartDate(formattedStartDate);
        setEndDate(formattedEndDate);
    } catch (error) {
        console.error("Error fetching orders:", error);
        setError(error);
    }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (event) => {
        const newSize = Number(event.target.value);
        setPageSize(newSize);
        setPage(0); // 페이지 크기 변경 시 첫 페이지로 초기화
    };

    return (
        <div className="payment-history-container">
            <h1 className="ffffffffff">결제 내역</h1>
            {error ? (
                <div>에러 발생: {error.message}</div>
            ) : (
                <>
                    <div className="date-range">
                        <span>조회 기간: {startDate} ~ {endDate}</span>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>테이블 번호</th>
                                <th>결제 시간</th>
                                <th>총 금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.table_id + order.payment_time}>
                                    <td>{order.table_number}</td>
                                    <td>{order.payment_time ? new Date(order.payment_time).toLocaleString() : '결제 없음'}</td>
                                    <td>{order.total_amount.toLocaleString()} 원</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <div>
                            페이지 크기:
                            <select value={pageSize} onChange={handlePageSizeChange}>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>
                        <div>
                            <button onClick={() => handlePageChange(0)} disabled={page === 0}>
                                처음
                            </button>
                            <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
                                이전
                            </button>
                            <span> {page + 1} / {totalPages} </span>
                            <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1}>
                                다음
                            </button>
                            <button onClick={() => handlePageChange(totalPages - 1)} disabled={page + 1 === totalPages}>
                                마지막
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ManagerSetting;
