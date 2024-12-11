import axios from 'axios';
import { debounce } from 'lodash';
import mqtt from 'mqtt';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // useParams를 import합니다.
import './ManagerMenu.css';

const ManagerMenu = () => {
    const { storeId } = useParams();  // storeId를 URL에서 받아옵니다.
    const [menuList, setMenuList] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(4);  // 한 페이지에 보여줄 메뉴 수
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [categoryList, setCategoryList] = useState([]);  // 카테고리 목록
    const [newIsAvailable, setNewIsAvailable] = useState(false);

    const [client, setClient] = useState(null);  // MQTT 클라이언트 state 추가
    const navigate = useNavigate();
    const [storeName, setStoreName] = useState('');

    // 검색 필터링 상태 추가
    const [searchName, setSearchName] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [order, setOrder] = useState('asc'); // 정렬 순서 추가

    // 수정할 메뉴 정보
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [newCategory, setNewCategory] = useState('');  // 카테고리명 상태 추가

    const debouncedSearch = debounce((name, category) => {
        handleSearch(name, category);
    }, 300); // 300ms 대기

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setSearchName(newName);
        debouncedSearch(newName, searchCategory); // 디바운스된 검색 실행
    };

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setSearchCategory(newCategory);
        debouncedSearch(searchName, newCategory); // 디바운스된 검색 실행
    };

    const isMqttConnected = () => {
        return client && client.connected;
    };

    const publishMessage = (topic, message) => {
        if (!isMqttConnected()) {
            console.error('MQTT not connected');
            return;
        }
        if (client) {
            client.publish(topic, JSON.stringify(message));
        }
    };

    // 페이지가 로드될 때 현재 URL을 localStorage에 저장
    useEffect(() => {
        try {
            // 현재 페이지의 URL을 localStorage에 저장하되, /Errorpage11 페이지는 제외
            if (window.location.pathname !== '/Errorpage11') {
                const storedPaths = localStorage.getItem('lastValidPaths');
                const lastValidPaths = storedPaths ? JSON.parse(storedPaths) : [];

                // 새로운 경로를 배열에 추가 (중복 방지)
                if (lastValidPaths[lastValidPaths.length - 1] !== window.location.pathname) {
                    lastValidPaths.push(window.location.pathname);
                }

                // 배열을 localStorage에 저장
                localStorage.setItem('lastValidPaths', JSON.stringify(lastValidPaths));
            }
        } catch (error) {
            console.error('Error handling localStorage:', error);
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

    // API 기본 URL (서버의 루트 경로 설정)
    const API_BASE_URL = 'http://localhost:8080/ROOT'; // ROOT context path 추가

    // 카테고리 목록 가져오기 조회
    useEffect(() => {
        if (storeId) {  // storeId가 존재하는 경우에만 요청
            axios.get(`${API_BASE_URL}/api/category/store/${storeId}/list`)
                .then((response) => {
                    if (response.data.status === 200) {
                        setCategoryList(response.data.data);  // 카테고리 목록 설정
                    } else {
                        alert('카테고리 목록을 조회할 수 없습니다.');
                    }
                })
                .catch((error) => {
                    console.error('카테고리 목록 조회 실패:', error);
                    alert('카테고리 목록 조회 중 오류가 발생했습니다.');
                });
        }
    }, [storeId]);  // storeId가 변경될 때마다 호출

    // 메뉴 목록 조회
    useEffect(() => {
        if (storeId) {
            // 검색 조건이 존재하면 검색 요청
            if (searchName || searchCategory) {
                axios.get(`${API_BASE_URL}/api/menu/${storeId}/search.do`, {
                    params: {
                        name: searchName || '', // 검색어
                        category: searchCategory || '', // 카테고리
                        page: currentPage, // 현재 페이지
                        size: pageSize, // 페이지 크기
                        sort: 'price', // 정렬 기준
                        order: order // 정렬 순서
                    }
                })
                    .then((response) => {
                        if (response.data.status === 200) {
                            setMenuList(response.data.data); // 검색 결과 업데이트
                            setTotalPages(response.data.totalPages); // 총 페이지 수 업데이트
                        } else {
                            setMenuList([]); // 검색 결과 없음
                        }
                    })
                    .catch((error) => {
                        console.error('검색 중 오류 발생:', error);
                        alert('검색 중 오류가 발생했습니다.');
                    });
            } else {
                // 검색 조건이 없을 경우 전체 메뉴 가져오기
                axios.get(`${API_BASE_URL}/api/menu/store/${storeId}/menulist.do`, {
                    params: {
                        page: currentPage,
                        size: pageSize,
                        sort: 'price',
                        order: order
                    }
                })
                    .then((response) => {
                        if (response.data.status === 200) {
                            setMenuList(response.data.data);
                            setTotalPages(response.data.totalPages);
                        } else {
                            setMenuList([]);
                        }
                    })
                    .catch((error) => {
                        console.error('메뉴 조회 중 오류 발생:', error);
                        alert('메뉴 목록 조회 중 오류가 발생했습니다.');
                    });
            }
        }
    }, [storeId, currentPage, pageSize, searchName, searchCategory, order]);

    useEffect(() => {
        if (!storeId) return; // storeId가 없으면 연결하지 않음

        const brokerUrl = 'ws://175.126.37.21:11884';
        const options = {
            clean: true,
            connectTimeout: 4000,
            clientId: `react-menu-${Math.random().toString(16).substring(2)}`,
            username: 'aaa',
            password: 'bbb',

            reconnectPeriod: 3000,
            rejectUnauthorized: false
        };

        let reconnectTimer = null;
        let currentClient = null;  // 현재 MQTT 클라이언트 참조 저장용 변수


        // MQTT 클라이언트 생성 및 연결 함수
        const connect = () => {
            console.log('MQTT 연결 시도...');
            const mqttClient = mqtt.connect(brokerUrl, options);
            currentClient = mqttClient;  // 현재 클라이언트 저장


            mqttClient.on('connect', () => {
                console.log('MQTT 브로커 연결 성공');
                setClient(mqttClient);

                // 연결 후 약간의 지연시간을 둔 후 구독 시도
                setTimeout(() => {
                    const topic = `bsit/class403/${storeId}/menu`;
                    if (mqttClient.connected) {  // 연결 상태 한번 더 확인
                        mqttClient.subscribe(topic, { qos: 1 }, (err) => {
                            if (!err) {
                                console.log(`토픽 구독 성공: ${topic}`);
                                setClient(mqttClient);  // 구독 성공 후 클라이언트 설정
                            } else {
                                console.error('토픽 구독 실패:', err);
                                if (reconnectTimer) {
                                    clearTimeout(reconnectTimer);
                                }
                                reconnectTimer = setTimeout(() => {
                                    console.log('구독 실패로 인한 재연결 시도...');
                                    mqttClient.end(true);
                                    connect();
                                }, 5000);
                            }
                        });
                    }
                }, 1000);  // 1초 지연
            });

            // 메시지 수신 핸들러
            mqttClient.on('message', (topic, message) => {
                try {
                    const data = JSON.parse(message.toString());
                    console.log('MQTT 메세지 수신:', data);

                    if (data.action === 'menuUpdate') {
                        setMenuList(prevList => {
                            const updatedList = prevList.map(menu =>
                                menu.id === data.menuId
                                    ? { ...menu, isAvailable: data.isAvailable }
                                    : menu
                            );
                            console.log('메뉴 목록 업데이트:', updatedList);
                            return updatedList;
                        });
                    }
                } catch (error) {
                    console.error('MQTT 메시지 처리 오류:', error);
                }
            });


            // 연결 종료 핸들러
            mqttClient.on('close', () => {
                console.log('MQTT 연결 종료');
                setClient(null);
                // 5초 후 재연결 시도
                setTimeout(connect, 5000);
            });

            // 에러 핸들러
            mqttClient.on('error', (err) => {
                console.error('MQTT 에러:', err);
                mqttClient.end();
            });


            // 오프라인 핸들러
            mqttClient.on('offline', () => {
                console.log('MQTT 클라이언트 오프라인');
                setClient(null);
            });
            return mqttClient;
        };

        // 초기 연결 시도
        connect();

        // 컴포넌트 언마운트 시 정리
        return () => {
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
            }
            if (currentClient) {  // currentClient 사용
                console.log('MQTT 연결 정리...');
                currentClient.end();
            }
        };
    }, [storeId]);

    // 메뉴 수정 및 삭제
    const handleEditMenu = (menu) => {
        setSelectedMenu(menu);
        setNewName(menu.name);
        setNewPrice(menu.price);
        setNewIsAvailable(menu.isAvailable); // 기존 값 반영
        setNewCategory(menu.cname); // 기존 카테고리명 상태로 설정
        setNewImage(null); // 이미지 초기화
    };

    const handleImageChange = (e) => {
        setNewImage(e.target.files[0]);
    };

    const handleUpdateMenu = (e) => {
        e.preventDefault();  // 폼 제출 방지
        const parsedPrice = parseFloat(newPrice);

        // 1. 가격 필드 검증
        if (isNaN(parsedPrice) || parsedPrice < 0 || !/^\d+$/.test(newPrice)) {
            alert('가격은 0 이상의 숫자여야 하며, 숫자 외의 문자가 포함될 수 없습니다.');
            return;
        }
        // 가격이 100원 단위로 입력되었는지 확인
        if (parsedPrice % 100 !== 0) {
            alert('가격은 최소 100원 단위로 입력되어야 합니다.');
            return;
        }

        const selectedCategory = categoryList.find(category => category.cname === newCategory);
        if (!selectedCategory) {
            alert('유효한 카테고리를 선택하세요.');
            return;
        }

        // 메뉴 수정 여부 확인
        const confirmUpdate = window.confirm('메뉴 수정을 하시겠습니까?');
        if (!confirmUpdate) {
            return;  // 사용자가 취소를 누르면 함수 종료
        }

        const formData = new FormData();
        formData.append('name', newName);
        formData.append('price', parsedPrice.toString());
        formData.append('cname', selectedCategory.cname);
        formData.append('isAvailable', newIsAvailable);
        if (newImage) formData.append('imageFile', newImage);
        formData.append('storeId', storeId);

        // DB와 일관성 있게 boolean을 0/1로 변환
        formData.append('isAvailable', newIsAvailable ? '1' : '0'); //string으로 변환

        //MQTT 즉시 메세지 발행
        const mqttMessage = {
            action: 'menuUpdate',
            menuId: selectedMenu.id,
            isAvailable: newIsAvailable ? 1 : 0, // 숫자로 변환
            storeId: storeId
        };

        // MQTT 메시지 발행 (연결 상태 확인 후)
        if (isMqttConnected()) {
            client.publish(`bsit/class403/${storeId}/menu`,
                JSON.stringify(mqttMessage), { qos: 1 }, (error) => {
                    if (error) {
                        console.error('MQTT publish error:', error);
                    } else {
                        console.log("MQTT message sent:", mqttMessage);

                        //메세지 발행 성공 후 UI 즉시 업데이트
                        setMenuList(prevList =>
                            prevList.map(menu =>
                                menu.id === selectedMenu.id
                                    ? { ...menu, isAvailable: newIsAvailable ? 1 : 0 }
                                    : menu
                            )
                        )
                    }
                }
            );
        }

        // API 호출 부분  
        axios.put(`${API_BASE_URL}/api/menu/store/${storeId}/menu/${selectedMenu.id}/update.do`, formData)
            .then((response) => {
                if (response.data.status === 200) {
                    alert('메뉴 수정에 성공했습니다.');
                    // 성공 시 menuList 업데이트
                    setMenuList(prevList => {
                        return prevList.map(menu =>
                            menu.id === selectedMenu.id
                                ? {
                                    ...menu,
                                    name: newName,
                                    price: parsedPrice,
                                    cname: selectedCategory.cname,
                                    isAvailable: newIsAvailable ? 1 : 0  // DB 형식과 일치
                                }
                                : menu
                        );
                    });

                    setSelectedMenu(null);
                    setNewName('');
                    setNewPrice('');
                    setNewImage(null);
                    setNewCategory('');
                    setNewIsAvailable('');
                } else {
                    alert('메뉴 수정 실패: ' + response.data.message);
                }
            })
            .catch((error) => {
                console.error('메뉴 수정 실패:', error);
                alert('메뉴 수정 중 오류가 발생했습니다.');
            });
    };

    const handleDelete = (menuId) => {
        const confirmDelete = window.confirm('현재 영업중인 메뉴입니다. 정말로 삭제하시겠습니까?');
        if (confirmDelete) {
            axios.delete(`${API_BASE_URL}/api/menu/store/${storeId}/menu/${menuId}/delete.do`)
                .then((response) => {
                    if (response.data.status === 200) {
                        alert('메뉴가 성공적으로 삭제되었습니다.');
                        setMenuList((prevList) => prevList.filter(menu => menu.id !== menuId));
                    } else {
                        alert('메뉴 삭제 실패: ' + response.data.message);
                    }
                })
                .catch((error) => {
                    console.error('메뉴 삭제 실패:', error);
                    alert('메뉴 삭제 중 오류가 발생했습니다.');
                });
        }
    };

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page); // 현재 페이지 상태만 업데이트
        }
    };

    const handleSearch = (name, category) => {
        setCurrentPage(0); // 검색 시 첫 페이지로 리셋
        axios.get(`${API_BASE_URL}/api/menu/${storeId}/search.do`, {
            params: {
                name: name || '',  // 매개변수에서 받은 이름
                category: category || '',  // 매개변수에서 받은 카테고리
                page: 0, // 항상 첫 페이지부터 시작
                size: pageSize,
                sort: 'price',  // 가격 기준으로 정렬
                order: order
            }
        })
            .then((response) => {
                if (response.data.status === 200) {
                    setMenuList(response.data.data); // 검색된 메뉴 목록을 상태에 설정
                    setTotalPages(response.data.totalPages); // 전체 페이지 수 업데이트
                } else {
                    setMenuList([]);  // 검색 결과가 없을 때 빈 배열로 설정
                }
            })
            .catch((error) => {
                console.error('검색 실패:', error);
                alert('검색 중 오류가 발생했습니다.');
            });
    };

    // 가격 정렬 변경 핸들러
    const handleSortChange = (e) => {
        const sortedOrder = e.target.value;
        setOrder(sortedOrder);  // 정렬 순서를 업데이트

        // 메뉴 목록을 가격에 맞게 정렬
        const sortedList = [...menuList].sort((a, b) => {
            if (sortedOrder === 'asc') {
                return a.price - b.price;  // 오름차순
            } else {
                return b.price - a.price;  // 내림차순
            }
        });

        setMenuList(sortedList);  // 정렬된 메뉴 목록을 상태에 반영
    };

    return (
        <div className='ManagerMenu-Container'>
            <div className='ManagerMenu-Title'>메뉴 관리</div>

            <div className="ManagerMenu-Search">
                <input className='ManagerMenu-Searchbox'
                    type="text"
                    placeholder="메뉴 이름으로 검색"
                    value={searchName}
                    onChange={handleNameChange}  // 디바운스 적용
                />
                <input
                    type="text"
                    placeholder="카테고리로 검색"
                    value={searchCategory}
                    onChange={handleCategoryChange}  // 디바운스 적용
                />
            </div>


            {/* 정렬 기준 선택 */}
            <div className="ManagerMenu-Sort">
                <label>가격순 : </label>
                {/* <select value={order} onChange={(e) => setOrder(e.target.value)}> */}
                <select value={order} onChange={handleSortChange}>
                    <option value="asc">오름차순</option>
                    <option value="desc">내림차순</option>
                </select>
            </div>

            {/* 메뉴 목록 */}
            <div className="ManagerMenu-List">
                {menuList.length === 0 ? (
                    // 메뉴가 없을 때 표시할 메시지
                    <div className='no-menu-message'>
                        메뉴 목록이 없습니다. 등록해주세요.
                    </div>
                ) : (
                    // 메뉴가 있을 때 기존의 메뉴 카드 표시
                    menuList.map((menu) => (
                        <div className='menu-card' key={menu.id}>
                            <div className="menu-card-content">
                                <div className='menu-card-title'>{menu.name}</div>
                                <div className='menu-card-money'>{menu.price}원</div>
                                <div className='menu-card-category'>카테고리 : {menu.cname}</div>
                                <div className='mcbtn'>
                                    <button className='mcbtnupdate' onClick={() => handleEditMenu(menu)}>수정 열기</button>
                                    <button className='mcbtndel' onClick={() => handleDelete(menu.id)}>삭제</button>
                                </div>
                            </div>
                            {/* 수정 화면 */}
                            <form>
                                {selectedMenu?.id === menu.id && (
                                    <div className="edit-menu-section">
                                        <h3>메뉴 수정</h3>
                                        <input className='emsec1'
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="메뉴 이름"
                                        />
                                        <input className='emsec1'
                                            type="text"
                                            value={newPrice}
                                            onChange={(e) => setNewPrice(e.target.value)}
                                            placeholder="가격"
                                        />
                                        {/* 카테고리 선택 드롭다운 */}
                                        <div>
                                            <select className='mmcategorysel'
                                                value={newCategory}
                                                onChange={(e) => setNewCategory(e.target.value)}
                                            >
                                                <option value="">카테고리 선택</option>
                                                {categoryList.map((category) => (
                                                    <option key={category.cname} value={category.cname}>
                                                        {category.cname}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label>
                                                사용 가능 여부:
                                                <select
                                                    value={newIsAvailable ? '1' : '0'} // 상태를 문자열로 변환
                                                    onChange={(e) => setNewIsAvailable(e.target.value === '1')} // 선택된 값에 따라 상태 업데이트
                                                    className="availability-select" // CSS 스타일링 가능
                                                >
                                                    <option value="1">사용 가능</option>
                                                    <option value="0">사용 불가</option>
                                                </select>
                                            </label>
                                        </div>
                                        <div>
                                            <input
                                                id="file-input"
                                                className="mmupdate-file"
                                                type="file"
                                                onChange={handleImageChange}
                                            />
                                            <label htmlFor="file-input" className="mmupdate-file-label">
                                                파일 선택
                                            </label>
                                            {newImage && <div className="mmupdate-file-name">선택한 파일: {newImage.name}</div>}
                                        </div>
                                        <button className='btnok' onClick={(e) => handleUpdateMenu(e)}>수정 완료</button>

                                        <button className='btnno' onClick={() => setSelectedMenu(null)}>취소</button>
                                    </div>
                                )}
                            </form>
                        </div>
                    ))
                )}
            </div>


            {/* 페이지네이션 */}
            <div className="ManagerMenu-Pagination">
                <button onClick={() => handlePageChange(0)} disabled={currentPage === 0}>
                    첫 페이지
                </button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
                    이전
                </button>

                <span> {currentPage + 1} / {totalPages} </span>

                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}>
                    다음
                </button>
                <button onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1}>
                    마지막 페이지
                </button>
            </div>
        </div>
    );
};

export default ManagerMenu;