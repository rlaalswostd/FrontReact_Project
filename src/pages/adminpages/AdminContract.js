import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminUser.css'; // CSS 파일을 불러옵니다.

const Users = () => {
    const [stores, setStores] = useState([]); // 매장 데이터
    const [contracts, setContracts] = useState([]); // 계약 데이터
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [page, setPage] = useState(0); // 현재 페이지
    const [totalPages, setTotalPages] = useState(0); // 총 페이지 수
    const [pageSize] = useState(5); // 페이지당 항목 수
    const [storeContractData, setStoreContractData] = useState([]); // 정렬된 전체 데이터
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // 정렬 기준과 방향 상태

    // 데이터를 가져오는 함수
    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                alert('로그인이 필요합니다.');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            const [storeResponse, contractResponse] = await Promise.all([
                axios.get('http://127.0.0.1:8080/ROOT/api/store/selectall.do', {
                    headers,
                    params: { page, size: pageSize },
                }),
                axios.get('http://127.0.0.1:8080/ROOT/api/contract/dashboard.do', {
                    headers,
                    params: { page: 0, size: 100, sortBy: 'startDate', sortDir: 'asc' },
                }),
            ]);

            console.log("storeResponse:",storeResponse.data);
            console.log("contractResponse:", contractResponse.data);

            setStores(storeResponse.data.result || []);
            setContracts(contractResponse.data.result || []);
            setTotalPages(storeResponse.data.totalPages || 0);
        } catch (error) {
            console.error("데이터 로딩 오류:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, pageSize]);

    // store와 contract 데이터를 결합하여 하나의 배열로 만들고 정렬하기
    useEffect(() => {
        if (stores.length > 0 && contracts.length > 0) {
            const contractMap = contracts.reduce((map, contract) => {
                map[contract.storeId] = contract;
                return map;
            }, {});

            const storeContract = stores.map(store => ({
                ...store,
                contract: contractMap[store.storeId] || {},
            }));

            const sortedStoreContractData = getSortedData(storeContract);
            setStoreContractData(sortedStoreContractData);
        }
    }, [stores, contracts, sortConfig]);

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        if (newPage < 0 || newPage >= totalPages) return; // 페이지 범위 벗어나지 않도록 처리
        setPage(newPage);
    };

    // 처음 페이지로 이동
    const goToFirstPage = () => {
        setPage(0);
    };

    // 끝 페이지로 이동
    const goToLastPage = () => {
        setPage(totalPages - 1);
    };

    // 정렬 처리 함수
    const handleSort = (sortBy) => {
        let newDirection = 'asc';

        // 동일한 열을 다시 클릭하면 내림차순으로 변경
        if (sortConfig.key === sortBy && sortConfig.direction === 'asc') {
            newDirection = 'desc';
        }

        setSortConfig({ key: sortBy, direction: newDirection });
    };

    // 정렬된 데이터 반환하는 함수
    const getSortedData = (data) => {
        const sortedData = [...data];
        if (sortConfig.key) {
            sortedData.sort((a, b) => {
                if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
                    const dateA = new Date(a.contract[sortConfig.key]);
                    const dateB = new Date(b.contract[sortConfig.key]);
                    return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
                }
                if (sortConfig.key === 'monthlyFee') {
                    return sortConfig.direction === 'asc' ? a.contract[sortConfig.key] - b.contract[sortConfig.key] : b.contract[sortConfig.key] - a.contract[sortConfig.key];
                }
                if (sortConfig.key === 'status') {
                    // 계약 상태는 'ACTIVE', 'EXPIRED' 순으로 정렬
                    const statusOrder = { 'ACTIVE': 1, 'EXPIRED': 2 };
                    return sortConfig.direction === 'asc'
                        ? statusOrder[a.contract.status] - statusOrder[b.contract.status]
                        : statusOrder[b.contract.status] - statusOrder[a.contract.status];
                }
                return 0;
            });
        }
        return sortedData;
    };

    // 페이지에 맞는 데이터만 가져오기
    const getPagedData = () => {
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        return storeContractData.slice(startIndex, endIndex);
    };

    // 로딩 중일 때
    if (loading) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="user-admin-container">
            <div className='user-title'>Market List || Dashboard</div>
            <table className="user-table">
                <thead className='user-table-thead'>
                    <tr>
                        <th>Store ID</th>
                        <th>매장명</th>
                        <th>주소</th>
                        <th>운영상태</th>
                        <th>전화번호</th>
                        <th>
                            계약시작일
                            <button onClick={() => handleSort('startDate')}>
                                {sortConfig.key === 'startDate' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '정렬'}
                            </button>
                        </th>
                        <th>
                            계약종료일
                            <button onClick={() => handleSort('endDate')}>
                                {sortConfig.key === 'endDate' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '정렬'}
                            </button>
                        </th>
                        <th>
                            월 이용료
                            <button onClick={() => handleSort('monthlyFee')}>
                                {sortConfig.key === 'monthlyFee' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '정렬'}
                            </button>
                        </th>
                        <th>
                            계약상태
                            <button onClick={() => handleSort('status')}>
                                {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '정렬'}
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {getPagedData().length > 0 ? (
                        getPagedData().map((data, index) => (
                            <tr key={index}>
                                <td>{data.storeId}</td>
                                <td className='user-table-tbody-storename'>{data.storeName}</td>
                                <td>{data.address}</td>
                                <td>{data.isActive ? 'Active' : 'Inactive'}</td>
                                <td>{data.phone}</td>
                                <td>{data.contract.startDate || '없음'}</td>
                                <td>{data.contract.endDate || '없음'}</td>
                                <td>{data.contract.monthlyFee || '없음'}</td>
                                <td className={data.contract.status === 'EXPIRED' ? 'expired-status' : (data.contract.status === 'ACTIVE' ? 'active-status' : '')}>
                                    {data.contract.status || '없음'}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9">매장 정보가 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* 페이지네이션 버튼 */}
            <div className="user-pagination">
                <button
                    onClick={goToFirstPage}
                    disabled={page === 0}>
                    처음
                </button>
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}>
                    이전
                </button>
                <span> 페이지 {page + 1} / {totalPages} </span>
                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page + 1 === totalPages}>
                    다음
                </button>
                <button
                    onClick={goToLastPage}
                    disabled={page + 1 === totalPages}>
                    끝
                </button>
            </div>
        </div>
    );
};

export default Users;
