import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './ManagerTablesPut.css';

const ManagerTablesPut = () => {
    const { storeId } = useParams();  // storeId를 URL 파라미터에서 가져옴
    const [tableList, setTableList] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [newTableNumber, setNewTableNumber] = useState('');
    const [isOccupied, setIsOccupied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(''); // 오류 메시지 상태 추가
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

    useEffect(() => {
        if (storeId) {
            setLoading(true);
            axios
                .get(`${API_BASE_URL}/api/tables/select.do?storeId=${storeId}`) // storeId를 쿼리 파라미터로 전달
                .then((response) => {
                    if (response.data.status === 200) {
                        const fetchedTables = response.data.data || [];
                        setTableList(fetchedTables);
    
                        // 테이블이 없을 경우 안내 메시지를 설정
                        if (fetchedTables.length === 0) {
                            setErrorMessage('등록된 테이블이 없습니다. 테이블을 추가해주세요.');
                        } else {
                            setErrorMessage(''); // 테이블이 있으면 메시지 초기화
                        }
                    } else {
                        console.error('테이블 목록 조회 실패:', response.data.message);
                    }
                })
                .catch((error) => {
                    console.error('테이블 목록 조회 실패:', error);
                    setErrorMessage('테이블 데이터를 가져오는 데 실패했습니다.');
                })
                .finally(() => setLoading(false));
        }
    }, [storeId]);


    const handleEditTable = (table) => {
        setSelectedTable(table);
        setNewTableNumber(table.tableNumber);
        setIsOccupied(table.isOccupied);
    };

    const handleUpdateTable = () => {
        if (!newTableNumber) {
            alert('테이블 번호를 입력하세요.');
            return;
        }

        // 새 테이블 번호가 이미 존재하는지 확인 (같은 storeId에서만 중복 체크)
        if (!storeId) {
            alert('매장 ID가 없습니다.');
            return;
        }

        const tableExists = tableList.some(table =>
            table.tableNumber === newTableNumber &&
            table.storeId === storeId &&
            table.tableId !== selectedTable.tableId // 수정하려는 테이블은 제외
        );

        if (tableExists) {
            alert('같은 매장 내에서 이미 사용 중인 테이블 번호입니다.');
            return;
        }

        // 중복이 없다면 업데이트 진행
        const updatedTable = {
            tableId: selectedTable.tableId,
            tableNumber: newTableNumber,
            isOccupied,
        };

        axios.put(`${API_BASE_URL}/api/tables/update.do`, updatedTable)
            .then((response) => {
                if (response.data.status === 'success') {
                    alert('테이블이 성공적으로 수정되었습니다.');
                    setTableList(prevList => prevList.map(table =>
                        table.tableId === selectedTable.tableId
                            ? { ...table, tableNumber: newTableNumber, isOccupied }
                            : table
                    ));
                    setSelectedTable(null);
                    setNewTableNumber('');
                    setIsOccupied(false);
                } else {
                    alert('테이블 수정 실패: ' + response.data.message);
                }
            })
            .catch((error) => {
                console.error('테이블 수정 실패:', error);
                alert('테이블 수정 중 오류가 발생했습니다.');
            });
    };


    const handleDeleteTable = (tableId, isOccupied) => {
        // isOccupied가 true이면 삭제할 수 없도록 경고 메시지 표시
        if (isOccupied) {
            alert('사용 중인 테이블은 삭제할 수 없습니다.');
            return; // isOccupied가 true일 때는 삭제 절차를 진행하지 않음
        }

        // isOccupied가 false일 때만 삭제 확인 창 표시
        const confirmDelete = window.confirm('정말로 삭제하시겠습니까?');
        if (confirmDelete) {
            axios.delete(`${API_BASE_URL}/api/tables/delete/${tableId}`)  // 경로 수정
                .then((response) => {
                    if (response.data.status === 'success') {
                        alert('테이블이 성공적으로 삭제되었습니다.');
                        setTableList(prevList => prevList.filter(table => table.tableId !== tableId));
                    } else {
                        alert('테이블 삭제 실패: ' + response.data.message);
                    }
                })
                .catch((error) => {
                    console.error('테이블 삭제 실패:', error);
                    alert('사용 중인 테이블은 삭제할 수 없습니다.');
                });
        }

    };

    const handleTableNumberChange = (e) => {
        const value = e.target.value;
        // 숫자만 허용하고, 음수는 제외
        if (/^\d*$/.test(value)) {
            setNewTableNumber(value); // 숫자만 상태에 저장
        }
    };
    


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="ManagerTablesPut-Container">
            <div className="ManagerTablesPut-Title">테이블 관리</div>
            <div className="ManagerTablesPut-List">
                {tableList.length === 0 ? (
                    <p>등록된 테이블이 없습니다.</p>
                ) : (
                    tableList.map((table) => (
                        <div className="table-card" key={table.tableId}>
                            <div className="table-card-content">
                                <div className="table-card-number">테이블 번호: {table.tableNumber}</div>
                                <div className="table-card-status">
                                    <span className={table.isOccupied ? 'occupied' : 'not-occupied'}>
                                        {table.isOccupied ? '사용중' : 'X'}
                                    </span>
                                </div>
                                <div className="table-card-actions">
                                    <button className="table-btn-edit" onClick={() => handleEditTable(table)}>수정</button>
                                    <button className="table-btn-delete" onClick={() => handleDeleteTable(table.tableId)}>삭제</button>
                                </div>
                                {selectedTable?.tableId === table.tableId && (
                                    <div className="table-edit-form">
                                        <h3>테이블 수정</h3>
                                        <div className='table-edit-form-num'>테이블 번호
                                            <input
                                                type="text"
                                                value={newTableNumber}
                                                onChange={handleTableNumberChange}  // 숫자만 입력하도록 처리
                                            />
                                        </div>
                                        <div className='table-edit-form-num2'>사용중 여부
                                            <input
                                                type="checkbox"
                                                checked={isOccupied}
                                                onChange={() => setIsOccupied(!isOccupied)}
                                            />
                                        </div>
                                        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                                        <button onClick={handleUpdateTable}>수정 완료</button>
                                        <button onClick={() => setSelectedTable(null)}>취소</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManagerTablesPut;
