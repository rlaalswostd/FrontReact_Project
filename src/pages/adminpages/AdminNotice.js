import React, { useState, useEffect } from 'react';
import axios from 'axios';
import mqtt from 'mqtt'; // mqtt 패키지 import
import { Button, Input } from 'antd';
import './AdminNotice.css';

const { TextArea } = Input;

const AdminNotice = () => {
    const [notices, setNotices] = useState([]);
    const [newNotice, setNewNotice] = useState({ title: '', content: '' });



    const [editingNotice, setEditingNotice] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedNoticeId, setExpandedNoticeId] = useState(null);
    const [mqttClient, setMqttClient] = useState(null);

    const token = localStorage.getItem('token');
    const brokerUrl = 'ws://175.126.37.21:11884'; // MQTT 브로커 URL
    const topic = 'bisit/class403/notices';

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleError = (error, action) => {
        console.error(`공지사항 ${action} 실패:`, error);
        const errorMessage = error.response?.data?.message || `공지사항 ${action}에 실패했습니다.`;
        alert(errorMessage);
    };

    const fetchNotices = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/ROOT/api/admin/notice/list.do', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.status === 200) {
                setNotices(response.data.result);
            }
        } catch (error) {
            handleError(error, '조회');
        } finally {
            setIsLoading(false);
        }
    };

    

    const createNotice = async () => {
        if (!newNotice.title.trim() || !newNotice.content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        const adminId = localStorage.getItem('adminId');
        if (!adminId) {
            alert('관리자 정보를 찾을 수 없습니다.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/ROOT/api/admin/notice/insert.do',
                { title: newNotice.title, content: newNotice.content, admin: { adminId: parseInt(adminId) } },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.status === 200) {
                alert('공지사항이 등록되었습니다.');
                setNewNotice({ title: '', content: '' });
                fetchNotices();

                // MQTT로 새 공지 발행
                mqttClient.publish(topic, JSON.stringify({
                    action: 'create',
                    title: newNotice.title,
                    content: newNotice.content
                }));
            }
        } catch (error) {
            handleError(error, '등록');
        } finally {
            setIsLoading(false);
        }
    };

    // MQTT 클라이언트 설정 및 연결
    useEffect(() => {
        const mqttInstance = mqtt.connect(brokerUrl);

        mqttInstance.on('connect', () => {
            console.log('MQTT connected');
            mqttInstance.subscribe(topic, (err) => {
                if (err) {
                    console.error('MQTT subscription failed:', err);
                }
            });
        });

        mqttInstance.on('message', (topic, message) => {
            console.log('Received MQTT message:', message.toString());
            const newNotice = JSON.parse(message.toString());

            if (newNotice.action === 'create' || newNotice.action === 'update') {
                fetchNotices(); // 목록 가져오기
            }
        });

        setMqttClient(mqttInstance);

        // MQTT 연결 해제
        return () => {
            mqttInstance.end();
        };
    }, []);

    const updateNotice = async (notice) => {
        if (!notice.title.trim() || !notice.content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        const adminId = localStorage.getItem('adminId');
        if (!adminId) {
            alert('관리자 정보를 찾을 수 없습니다.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.put('http://localhost:8080/ROOT/api/admin/notice/update.do',
                { noticeId: notice.noticeId, title: notice.title, content: notice.content },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.status === 200) {
                alert('공지사항이 수정되었습니다.');
                setEditingNotice(null);
                fetchNotices();

                // MQTT로 수정된 공지
                mqttClient.publish(topic, JSON.stringify({
                    action: 'update',
                    noticeId: notice.noticeId,
                    title: notice.title,
                    content: notice.content
                }));
            }
        } catch (error) {
            handleError(error, '수정');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteNotice = async (noticeId) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;

        setIsLoading(true);

        try {
            const response = await axios.delete('http://localhost:8080/ROOT/api/admin/notice/delete.do',
                { params: { noticeId }, headers: { 'Authorization': `Bearer ${token}` } });

            if (response.data.status === 200) {
                alert('공지사항이 삭제되었습니다.');
                fetchNotices();

                // MQTT로 삭제된 공지사항 발행
                mqttClient.publish(topic, JSON.stringify({
                    action: 'delete',
                    noticeId
                }));
            }
        } catch (error) {
            handleError(error, '삭제');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    return (
        <div className='notice-con'>
            <div className='notice-first'>공지사항 관리</div>

            {/* 공지사항 작성 폼 */}
            <div className='notice-form'>
                <h3>새 공지사항 작성은 여기에</h3>
                <form onSubmit={(e) => e.preventDefault()}>
                    <input className='notice-write1'
                        type="text" placeholder="제목" value={newNotice.title} onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })} />
                    <textarea className='notice-write2'
                        placeholder="내용" value={newNotice.content} onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })} />
                    <button type="button" onClick={createNotice}>등록</button>
                </form>
            </div>

            {/* 공지사항 목록 */}
            <div className="notice-list">
                {notices.map((notice) => (
                    <div className="notice-item" key={notice.noticeId}>
                        {editingNotice?.noticeId === notice.noticeId ? (
                            <div className="notice-edit">
                                <input className='notice-write1'
                                    type="text"
                                    value={editingNotice.title}
                                    onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                                />
                                <textarea className='notice-write2'
                                    value={editingNotice.content}
                                    onChange={(e) => setEditingNotice({ ...editingNotice, content: e.target.value })}
                                />
                                <div className="notice-button-group">
                                    <button className='noticeupd' type="button" onClick={() => updateNotice(editingNotice)}>저장</button>
                                    <button className='noticedel' type="button" onClick={() => setEditingNotice(null)}>취소</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="notice-header"
                                    onClick={() => setExpandedNoticeId(
                                        expandedNoticeId === notice.noticeId ? null : notice.noticeId
                                    )}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <h3 className="notice-title">
                                        {notice.title}
                                        <span className="notice-date">{formatDate(notice.createdAt)}</span>
                                    </h3>
                                </div>

                                {expandedNoticeId === notice.noticeId && (
                                    <div className="notice-content-expanded">
                                        <p>{notice.content}</p>
                                        <div className="notice-button-group">
                                            <button className='noticeupd' type="button" onClick={() => setEditingNotice(notice)}>수정</button>
                                            <button className='noticedel' type="button" onClick={() => deleteNotice(notice.noticeId)}>삭제</button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminNotice;
