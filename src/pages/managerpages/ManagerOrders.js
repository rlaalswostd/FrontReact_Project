// React 필수 패키지 및 컴포넌트 import
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ManagerOrders.css';
import OrderNotification from '../../components/OrderNotification';
import mqtt from 'mqtt';


const ManagerOrders = () => {
    // URL 파라미터에서 adminId와 storeId 추출
    const { adminId, storeId } = useParams();
    // 상태 관리를 위한 useState 훅 선언
    const [orders, setOrders] = useState([]); // 주문 목록 상태
    const [selectedOrder, setSelectedOrder] = useState(null); // 선택된 주문 상세 정보
    const [showModal, setShowModal] = useState(false); // 모달 표시 여부
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
    const [storeName, setStoreName] = useState(''); // 매장 이름
    const ordersPerPage = 6; // 페이지당 표시할 주문 수
    const [todayDate, setTodayDate] = useState(''); // 오늘 날짜
    const navigate = useNavigate(); // 페이지 네비게이션
    const [client, setClient] = useState(null); // MQTT 클라이언트
    // ManagerOrders.js 내부
    const notificationRef = useRef(null);
    const [audioEnabled, setAudioEnabled] = useState(false);


    // 컴포넌트 마운트 시 초기화 및 MQTT 연결 설정
    useEffect(() => {
        let mqttClient = null;

        // 로컬 스토리지에서 매장 정보 가져오기
        const savedStoreId = localStorage.getItem('storeId');
        const savedStoreName = localStorage.getItem('storeName');

        // storeId 검증
        if (storeId && savedStoreId !== storeId) {
            navigate('/Errorpage11');
            return;
        }

        if (savedStoreName) {
            setStoreName(savedStoreName);
        }

        // MQTT 연결 함수
        const connectMqtt = () => {
            // 이전 연결이 있다면 종료
            if (mqttClient) {
                mqttClient.end();
            }

            const brokerUrl = 'ws://175.126.37.21:11884';
            const options = {
                clean: true,
                connectTimeout: 4000,        // 타임아웃 시간 증가
                clientId: `react-orders-${new Date().getTime()}`,
                username: 'aaa',
                password: 'bbb',
                keepalive: 60,              // keepalive 간격 설정
                reconnectPeriod: 5000,      // 재연결 주기
                protocolVersion: 4,         // MQTT 프로토콜 버전
                rejectUnauthorized: false   // SSL/TLS 검증 비활성화
            };

            // 새로운 MQTT 클라이언트 생성 및 연결
            mqttClient = mqtt.connect(brokerUrl, options);

            // 연결 성공 시 이벤트 핸들러
            mqttClient.on('connect', () => {
                console.log('MQTT Connected at:', new Date().toISOString());
                console.log('Current storeId:', storeId);
                const topic = `bsit/class403/store/${storeId}`;
                console.log('Attempting to subscribe to topic:', topic);

                if (mqttClient.connected) {
                    mqttClient.subscribe(topic, (err) => {
                        if (!err) {
                            console.log('Successfully subscribed to:', topic, 'at:', new Date().toISOString());
                            setClient(mqttClient);
                            console.log('MQTT Client state:', mqttClient.connected ? 'Connected' : 'Disconnected');
                        } else {
                            if (mqttClient.disconnecting) {
                                console.error('Subscription failed: client is disconnecting', err);
                            } else {
                                console.error('Subscription error:', err);
                                console.error('MQTT Client state:', mqttClient.connected ? 'Connected' : 'Disconnected');
                            }
                            setTimeout(connectMqtt, 3000);
                        }
                    });
                } else {
                    console.warn('Client not connected. Subscription skipped.');
                    console.warn('MQTT Client state:', mqttClient.connected ? 'Connected' : 'Disconnected');
                    setTimeout(connectMqtt, 3000);
                }
            });

            // 메시지 수신 처리
            mqttClient.on('message', (topic, message) => {
                try {
                    // 메시지 수신 로깅

                    const orderData = JSON.parse(message.toString());
                    console.log('MQTT 메시지 수신:', new Date().toISOString());
                    console.log('받은 주문 데이터:', orderData);

                    const messageStoreId = orderData.storeId?.toString();
                    if (!messageStoreId || messageStoreId !== storeId.toString()) {
                        return;
                    }

                    if (orderData.action === 'create') {
                        console.log('알림음 재생 시도 전:', new Date().toISOString());
                        if (notificationRef.current) {
                            notificationRef.current.playNotification();
                            console.log('알림음 재생 함수 호출 완료');
                        } else {
                            console.error('notificationRef가 없음');
                        }

                        const formattedItems = orderData.items.map(item => ({
                            name: item.menuName,
                            quantity: item.quantity
                        }));

                        const newOrder = {
                            id: Date.now(),
                            type: '주문',
                            tableNumber: orderData.tableNumber,
                            time: new Date(),
                            items: formattedItems,
                            date: new Date().toISOString().split('T')[0],
                            isNew: true
                        };

                        setOrders(prevOrders => [newOrder, ...prevOrders]);
                        setTimeout(fetchOrders, 100);
                    }
                } catch (error) {
                    console.error('메시지 처리 오류:', error);
                }
            });

            mqttClient.on('disconnect', () => {
                console.log('MQTT Disconnected at:', new Date().toISOString());
                setTimeout(connectMqtt, 3000);
            });

            mqttClient.on('close', () => {
                console.log('MQTT Connection closed at:', new Date().toISOString());
                setTimeout(connectMqtt, 3000);
            });

            mqttClient.on('reconnect', () => {
                console.log('MQTT Attempting to reconnect at:', new Date().toISOString());
            });

            mqttClient.on('error', (err) => {
                console.error('MQTT error:', err);
            });
        };
        // 초기 연결 실행
        connectMqtt();

        // cleanup
        return () => {
            if (mqttClient) {
                mqttClient.end();
                console.log('MQTT connection cleaned up at:', new Date().toISOString());
            }
        };
    }, [storeId, navigate]);

    // 컴포넌트 언마운트 시 MQTT 연결 해제
    // return () => {
    //    if (mqttClient && !mqttClient.disconnecting && !mqttClient.disconnected) {
    //      mqttClient.end();
    //    console.log('Disconnected from MQTT broker');
    //}
    //};

    // 우선 여기        
    // MQTT 메시지 수신 처리
    // 메시지 수신 처리
    // 여기 이 부분을 수정해야 합니다


    // 오늘 날짜를 'YYYY-MM-DD' 형식으로 반환하는 함수
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 주문 상태를 한글로 변환하는 함수
    const convertOrderStatus = (status) => {
        switch (status) {
            case 'CANCELLED':
                return '주문취소';
            case 'COMPLETED':
                return '주문완료';
            case 'ORDERED':
                return '주문';
            default:
                return '알 수 없음';
        }
    };

    // 서버에서 주문 데이터를 가져오는 함수
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            // API 호출하여 주문 데이터 가져오기
            const response = await axios.get(
                `http://127.0.0.1:8080/ROOT/api/orders/items/groupedByStore/${storeId}`,
                {
                    params: {
                        adminId: adminId,
                        storeId: storeId
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // 서버 응답 데이터 형식 변환
            const formattedData = response.data.map((item, index) => {
                // item[0]: tableNumber, item[1]: names (menu), item[2]: quantities (menu quantity)
                const menuNames = item[1].split(',');
                const quantities = item[2].split(',');

                const items = menuNames.map((name, i) => ({
                    name: name,
                    quantity: parseInt(quantities[i], 10) || 1  // 수량이 없으면 기본값 1
                }));

                return {
                    id: item[5],  // orderId (고유 ID)
                    type: convertOrderStatus(item[4]),  // 상태
                    tableNumber: item[0],  // 테이블 번호
                    time: new Date(item[3]),  // 주문 시간
                    items: items,  // 메뉴 아이템 리스트
                    date: new Date(item[3]).toISOString().split('T')[0],  // 주문 날짜
                    isNew: true  // 새로운 주문으로 표시
                };
            });

            // 오늘 날짜의 주문만 필터링
            const today = getTodayDate();
            const todayOrders = formattedData.filter(order => order.date === today);
            setOrders(todayOrders);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // 컴포넌트 마운트 시 초기 데이터 로드
    useEffect(() => {
        const today = getTodayDate();
        setTodayDate(today);
        fetchOrders();
    }, [adminId]);

    // 주문 목록을 시간 순으로 정렬
    const sortedOrders = [...orders].sort((a, b) => b.time - a.time);

    // 주문 상세 정보를 표시하는 함수
    const handleShowDetails = async (order) => {
        console.log("Selected Order:", order);
        try {
            const token = localStorage.getItem('token');
            const tableId = order.tableNumber;

            // 선택된 주문의 상세 정보 가져오기
            const response = await axios.get(
                `http://127.0.0.1:8080/ROOT/api/orders/items/byStore/${storeId}/table/${tableId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // 응답 데이터 구조 확인
            console.log("Response data:", response.data);


            // 주문 아이템 정보 업데이트
            const updatedItems = order.items.map((item) => {
                // response.data가 Object[] 형태이므로, 각 아이템을 인덱스 1 (name)과 2 (quantity)로 매칭
                const matchingData = response.data.find(d => d[1] === item.name); // 해당 아이템 이름으로 매칭
                console.log("Matching Data:", matchingData);

                return {
                    ...item,
                    quantity: matchingData ? matchingData[2] : item.quantity, // 수량을 업데이트
                };
            });

            // 상세 정보 상태 업데이트 및 모달 표시
            setSelectedOrder({
                ...order,
                items: updatedItems, // 수정된 아이템 정보 반영
            });
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching detailed data:', error);
        }
    };



    // 모달 닫기 핸들러
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };


    const generateOrderDetails = (items) => {
        console.log("Full Items Object:", items);  // 전체 items 객체 로깅
        console.log("Items Type:", typeof items);  // items의 타입 확인
        console.log("Is Array:", Array.isArray(items));  // 배열인지 확인
        if (!items) {
            console.log("Items is null or undefined");
            return '이름없음';
        }

        try {
            console.log("Items length:", items.length);  // items 길이 확인

            if (items.length > 1) {
                console.log("First item:", items[0]);  // 첫 번째 아이템의 전체 구조
                const firstItemName = items[0].name;
                console.log("First item name:", firstItemName);  // 첫 번째 아이템의 이름
                const additionalItemsCount = items.length - 1;

                if (firstItemName !== undefined && firstItemName !== null) {
                    return `${firstItemName} 외 ${additionalItemsCount}개`;
                } else {
                    return `이름없음 외 ${additionalItemsCount}개`;
                }
            } else if (items.length === 1) {
                console.log("Single item:", items[0]);  // 단일 아이템 케이스
                const firstItemName = items[0].name;
                return firstItemName ? firstItemName : '이름없음';
            } else {
                console.log("Empty items array");
                return '이름없음';
            }
        } catch (error) {
            console.error("Error in generateOrderDetails:", error);
            return '이름없음 (에러)';
        }
    };


    // 페이지네이션 관련 계산
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    // 페이지 변경 핸들러
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // 페이지 번호 배열 생성
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(sortedOrders.length / ordersPerPage); i++) {
        pageNumbers.push(i);
    }

    // UI 렌더링
    return (
        <div>
            {/* 헤더 영역 */}
            <OrderNotification ref={notificationRef} />

            <div className="ordermain">
                <div className="today-date">
                    <div>{todayDate}</div>
                    {storeName && <span className="store-name">{storeName}</span>}
                    {client?.connected && (
                        <span style={{ fontSize: '12px', color: 'green', marginLeft: '8px' }}>
                            (실시간 주문 수신중)
                        </span>
                    )}
                </div>
                <div>전체 주문 보기</div>
            </div>




            {/* 매장 ID 표시 (개발용) */}
            <div className="store-id-display">
                <p>현재 storeId: {storeId ? storeId : 'storeId가 없습니다'}</p>
            </div>

            {/* 주문이 없을 때 표시할 메시지 */}
            {orders.length === 0 && (
                <div className="no-orders">
                    <p>주문한 내용이 없습니다. 오늘 하루도 화이팅하세요 사장님~</p>
                </div>
            )}

            {/* 주문 목록 테이블 */}
            <table className="order-table">
                <thead>
                    <tr>
                        <th className="type-column">주문유형</th>
                        <th className="table-number-column">테이블번호</th>
                        <th>주문내역</th>
                        <th>주문시간</th>
                        <th>비고</th>
                    </tr>
                </thead>
                <tbody>
                    {currentOrders.map((order) => (
                        <tr
                            key={order.id}
                            style={{
                                animation: order.isNew ? 'fadeIn 0.5s' : 'none',
                                backgroundColor: order.isNew ? '#f0f8ff' : 'white'
                            }}
                        >
                            <td>{order.type}</td>
                            <td className="table-number-box">{order.tableNumber}</td>
                            <td>{generateOrderDetails(order.items)}</td>
                            <td>{order.time.toLocaleTimeString('ko-KR')}</td>
                            <td>
                                <button className='bigobutton' onClick={() => handleShowDetails(order)}>
                                    상세보기
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 주문 상세 정보 모달 */}
            {showModal && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>테이블번호 {selectedOrder.tableNumber}번</h3>
                        <hr />
                        <table style={{ width: '100%', textAlign: 'center' }}>
                            <thead>
                                <tr>
                                    <th>주문메뉴</th>
                                    <th>수량</th>
                                </tr>
                            </thead>
                            <tbody className='modaltbody'>
                                {selectedOrder.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className='modalbutton' onClick={handleCloseModal}>닫기</button>
                    </div>
                </div>
            )}

            {/* 페이지네이션 */}
            <div className="pagination">
                {/* 이전 버튼 */}
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1} // 첫 페이지에서 비활성화
                >
                    이전
                </button>

                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={currentPage === number ? 'active' : ''}
                    >
                        {number}
                    </button>
                ))}

                {/* 다음 버튼 */}
                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === pageNumbers.length} // 마지막 페이지에서 비활성화
                >
                    다음
                </button>
            </div>

        </div>
    );
};

export default ManagerOrders;