// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// function Dashboard() {
//     const [stores, setStores] = useState([]); // 매장 데이터
//     const [contracts, setContracts] = useState([]); // 계약 데이터
//     const [loading, setLoading] = useState(true); // 로딩 상태
//     const [page, setPage] = useState(0); // 현재 페이지
//     const [totalPages, setTotalPages] = useState(0); // 총 페이지 수
//     const [pageSize] = useState(10); // 페이지당 항목 수

//     // 매장 정보와 계약 정보 가져오기
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true); // 데이터 로딩 시작

//                 // 매장 정보 가져오기 (페이지네이션)
//                 const storeResponse = await axios.get
//                     (`http://127.0.0.1:8080/ROOT/api/store/selectall.do?page=${page}&size=${pageSize}`);
//                 setStores(storeResponse.data.result || []); // 데이터가 없으면 빈 배열로 설정
//                 setTotalPages(storeResponse.data.totalPages || 0); // 전체 페이지 수

//                 // 계약 정보 가져오기 (페이지네이션)
//                 const contractResponse = await axios.get(`http://127.0.0.1:8080/ROOT/api/contract/select.do?page=${page}&size=${pageSize}`);
//                 setContracts(contractResponse.data.data || []); // 데이터가 없으면 빈 배열로 설정

//                 setLoading(false); // 데이터 로딩 완료
//             } catch (error) {
//                 console.error("에러 발생: ", error);
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [page, pageSize]); // page 또는 pageSize가 변경될 때마다 fetchData 실행

//     // 페이지 변경 핸들러
//     const handlePageChange = (newPage) => {
//         if (newPage < 0 || newPage >= totalPages) return; // 페이지 범위 벗어나지 않도록 처리
//         setPage(newPage);
//     };

//     // 매장과 계약 데이터를 결합 (store와 contract가 일치하는지 확인)
//     const storeContractData = stores.map(store => {
//         const contract = contracts.find(c => c.storeId === store.storeId); // storeId로 contract 찾기
//         return {
//             ...store,
//             contract: contract || {}, // 계약 정보가 없으면 빈 객체로 처리
//         };
//     });

//     // 로딩 중일 때
//     if (loading) {
//         return <div>로딩 중...</div>;
//     }

//     return (
//         <div>
//             <h2>매장 계약 정보</h2>
//             <table border="1">
//                 <thead>
//                     <tr>
//                         <th>Store ID</th>
//                         <th>주소</th>
//                         <th>운영상태</th>
//                         <th>전화번호</th>
//                         <th>매장명</th>
//                         <th>계약시작일</th>
//                         <th>계약종료일</th>
//                         <th>월 이용료</th>
//                         <th>계약상태</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {storeContractData.length > 0 ? (
//                         storeContractData.map((data, index) => (
//                             <tr key={index}>
//                                 <td>{data.storeId}</td>
//                                 <td>{data.address}</td>
//                                 <td>{data.isActive ? 'Active' : 'Inactive'}</td>
//                                 <td>{data.phone}</td>
//                                 <td className='user-table-tbody-storename'>{data.storeName}</td>
//                                 <td>{data.contract.startDate || '없음'}</td> {/* 계약 시작일 없으면 '없음' */}
//                                 <td>{data.contract.endDate || '없음'}</td> {/* 계약 종료일 없으면 '없음' */}
//                                 <td>{data.contract.monthlyFee ? new Intl.NumberFormat('ko-KR').format(data.contract.monthlyFee) + '원' : '없음'} </td>
//                                 <td>{data.contract.status || '없음'}</td> {/* 계약 상태 없으면 '없음' */}
//                             </tr>
//                         ))
//                     ) : (
//                         <tr>
//                             <td colSpan="9">매장 정보가 없습니다.</td>
//                         </tr>
//                     )}
//                 </tbody>
//             </table>

//             {/* 페이지네이션 버튼 */}
//             <div className="user-pagination">
//                 <button
//                     onClick={() => handlePageChange(page - 1)}
//                     disabled={page === 0}>
//                     이전
//                 </button>
//                 <span> 페이지 {page + 1} / {totalPages} </span>
//                 <button
//                     onClick={() => handlePageChange(page + 1)}
//                     disabled={page + 1 === totalPages}>
//                     다음
//                 </button>
//             </div>
//         </div>
//     );
// }

// export default Dashboard;
