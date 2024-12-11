import { Button, Card, Modal, Pagination } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSse } from '../contexts/SseContext';
import mqtt from 'mqtt';
import './ManagerNotice.css';
import { useNavigate, useParams } from 'react-router-dom';

//11 재깃 
function ManagerNotice() {
    const { storeId } = useParams();  // 이 줄 추가 (최상단 state 선언부에)
    const noticegongzi = "알림공지";

    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [mqttClient, setMqttClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);


    //MQTT 설정하는 곳
    const brokerUrl = 'ws://175.126.37.21:11884';
    const topic = 'bisit/class403/notices';

    // 페이지네이션 상태를 나타내는 곳.
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(3);
    const navigate = useNavigate();
    const [storeName, setStoreName] = useState('');

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

    const formatDate = (dateString) => {
        if (!dateString) return '날짜 없음';

        try {
            return new Date(dateString).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('날짜 변환 중 에러:', error);
            return '날짜 형식 에러';
        }
    };

    const fetchNotices = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/ROOT/api/admin/notice/list.do', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                setNotices(response.data.result || []); // 기본값 설정 <<<
            }
        } catch (error) {
            console.error('조회 중 에러 발생:', error);
            setNotices([]); // 에러 시 빈 배열로 설정함
        }
    };

    // MQTT 연결 설정
    useEffect(() => {
        const client = mqtt.connect(brokerUrl);

        client.on('connect', () => {
            console.log('MQTT Connected');
            setIsConnected(true);

            client.subscribe(topic, (err) => {
                if (err) {
                    console.error('MQTT subscription error:', err);
                } else {
                    console.log('Subscribed to', topic);
                }
            });
        });
        //공지 목록 자동 새로고침 및 실시간 업데이트 받는 곳.
        client.on('message', async (receivedTopic, message) => {
            try {
                const noticeData = JSON.parse(message.toString());

                switch (noticeData.action) {
                    case 'create':
                    case 'update':
                    case 'delete':
                        //새로고침
                        await fetchNotices();
                        break;
                    default:
                        console.log('Unknown action:', noticeData.action);

                }
            } catch (error) {
                console.error('Error processing MQTT message', error);
            }
        });
        client.on('error', (err) => {
            console.error('MQTT error:', err);
            setIsConnected(false);
        });
        setMqttClient(client);

        return () => {
            if (client) {
                client.end();
            }
        };
    }, []);
    // 초기 데이터 로드
    useEffect(() => {
        setIsLoading(true);
        fetchNotices().finally(() => setIsLoading(false));
    }, []);

    const openModal = (notice) => {
        setSelectedNotice(notice);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedNotice(null);
    };

    const paginatedNotices = notices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className='ManagerNotice-con'>
            <div className='MN-title'>
                공지사항
                {isConnected && <span style={{ fontSize: '12px', color: 'green', marginLeft: '8px' }}>
                    (connect)
                </span>}
            </div>
            {isLoading ? (
                <p className='MN-title'>로딩 중...</p>
            ) : paginatedNotices?.length > 0 ? (
                <>
                    {paginatedNotices.map((notice, index) => (
                        <Card
                            key={notice.id || index}
                            style={{
                                marginBottom: '40px',
                                animation: notice.isNew ? 'fadeIn 0.5s' : 'none',
                            }}
                            onClick={() => openModal(notice)}
                        >
                            <div className='noticegongzi1'>{noticegongzi}</div>
                            <div className='noticedate'>{formatDate(notice.createdAt)}</div>
                            <div className='noticetitle'>
                                <i className="fa fa-clone" style={{ marginRight: '8px' }}></i>
                                {notice.title}
                            </div>
                        </Card>
                    ))}
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={notices?.length || 0}
                        onChange={setCurrentPage}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '20px',
                        }}
                    />
                </>
            ) : (
                <p className='MN-nothing'>공지사항이 없습니다.</p>
            )}

            <Modal className='noticemodal-total'
                title={<div className="noticemodal">{selectedNotice?.title}</div>}
                visible={isModalOpen}
                onCancel={closeModal}
                footer={<Button onClick={closeModal}>닫기</Button>}
                centered
            >
                <div className='noticemodalcon'>
                    <i className="fa fa-hand-o-right" style={{ marginRight: '8px' }}></i>
                    {selectedNotice?.content}
                </div>
            </Modal>
        </div>
    );
}


export default ManagerNotice;