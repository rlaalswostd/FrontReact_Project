import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminUser.css";

const Users = () => {
    const [data, setData] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedContract, setSelectedContract] = useState(null); // 수정할 데이터
    const [form, setForm] = useState({
        storeName: "",
        address: "",
        phone: "",
        startDate: "",
        endDate: "",
        monthlyFee: "",
        status: "",
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                "http://127.0.0.1:8080/ROOT/api/contract/dashboard.do",
                {
                    params: {
                        page: currentPage,
                        size: 10,
                        sortBy: "endDate",
                        sortDir: "asc",
                        contractStatus: "ACTIVE",
                    },
                }
            );
            setData(response.data.result);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("데이터 로딩 오류:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    // 수정 버튼 클릭 시 호출
    const handleEditClick = (contract) => {
        setSelectedContract(contract);
        setForm({
            storeName: contract.storeName,
            address: contract.address,
            phone: contract.phone,
            startDate: contract.startDate,
            endDate: contract.endDate,
            monthlyFee: contract.monthlyFee,
            status: contract.status,
        });
    };

    // 폼 변경 처리
    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 수정 요청
    const handleSubmit = async () => {
        console.log("Selected Contract ID:", selectedContract.contractId);
        const formattedForm = {
            ...form,
            monthlyFee: parseFloat(form.monthlyFee).toFixed(2), // 숫자로 변환 후 소수점 두 자리까지 포맷팅
            startDate: new Date(form.startDate).toISOString().split('T')[0], // 날짜 형식
            endDate: new Date(form.endDate).toISOString().split('T')[0],     // 날짜 형식
        };
        console.log("Formatted Form:", formattedForm);
        try {
            await axios.put(
                `http://127.0.0.1:8080/ROOT/api/contract/${selectedContract.contractId}/update`,
                formattedForm
            );
            alert("수정되었습니다.");
            setSelectedContract(null); // 모달 닫기
            fetchData(); // 데이터 갱신
        } catch (error) {
            console.error("수정 오류:", error.response?.data || error.message);
            alert("수정 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="user-admin-container">
            <div className="user-title">Market List || Dashboard</div>
            {loading ? (
                <p>로딩 중...</p>
            ) : (
                <div>
                    <div className="dashboard-color-guide">
                        <span className="dashboard-danger">■</span> 1주일 이내 계약 만료     
                        <span className="dashboard-warning">■</span> 1년 이내 계약 만료
                    </div>
                    <table className="user-table">
                        <thead className="user-table-thead">
                            <tr>
                                <th>매장 ID</th>
                                <th>매장명</th>
                                <th>주소</th>
                                <th>전화번호</th>
                                <th>계약 시작일</th>
                                <th>계약 종료일</th>
                                <th>월 이용료</th>
                                <th>계약상태</th>
                                <th>수정</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.storeId}</td>
                                    <td>{item.storeName}</td>
                                    <td>{item.address}</td>
                                    <td>{item.phone}</td>
                                    <td>{item.startDate}</td>
                                    <td
                                        className={
                                            new Date(item.endDate) <= new Date(new Date().setDate(new Date().getDate() + 7))
                                                ? "dashboard-danger" // 1주일 이내면 빨간색
                                                : new Date(item.endDate) <= new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                                                    ? "dashboard-warning" // 1년 이내면 주황색
                                                    : "" // 기본
                                        }
                                    >
                                        {item.endDate}
                                    </td>

                                    <td>{Number(item.monthlyFee).toLocaleString('ko-KR')} 원</td>
                                    <td>
                                        <span className={`status ${item.status.toLowerCase()}-status`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => handleEditClick(item)}>수정</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="user-pagination">
                        <button
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(currentPage - 1)}>
                            이전
                        </button>
                        <span> 페이지 {currentPage + 1} / {totalPages} </span>
                        <button
                            disabled={currentPage === totalPages - 1}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            다음
                        </button>
                    </div>
                </div>
            )}

            {selectedContract && (
                <div className="dashboard-modal">
                    <div className="dashboard-modal-title">사장님 관리 매장 수정</div>
                    <label>매장명</label>
                    <input
                        name="storeName"
                        value={form.storeName}
                        onChange={handleFormChange}
                    />
                    <label>주소</label>
                    <input name="address" value={form.address} onChange={handleFormChange} />
                    <label>전화번호</label>
                    <input name="phone" value={form.phone} onChange={handleFormChange} />
                    <label>계약 시작일</label>
                    <input name="startDate" value={form.startDate} onChange={handleFormChange} />
                    <label>계약 종료일</label>
                    <input name="endDate" value={form.endDate} onChange={handleFormChange} />
                    <label>월 이용료</label>
                    <input name="monthlyFee" value={form.monthlyFee} onChange={handleFormChange} />
                    <label>계약 상태</label>
                    <select name="status" value={form.status} onChange={handleFormChange}>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="EXPIRED">EXPIRED</option>
                    </select>
                    <div className="dashboard-modal-btn">
                        <button className="dashboard-modal-ok" onClick={handleSubmit}>저장</button>
                        <button className="dashboard-modal-no" onClick={() => setSelectedContract(null)}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );

};

export default Users;
