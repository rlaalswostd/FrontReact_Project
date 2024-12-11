import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function StoreSelector() {
    const { adminId } = useParams();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const token = localStorage.getItem('token');
                
                const response = await axios.get(
                    `http://localhost:8080/ROOT/api/store/stores/${adminId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true
                    }
                );

                if (response.data.status === 'success') {
                    setStores(response.data.data);
                    
                    // 만약 localStorage에 저장된 storeId가 있다면 해당 store를 선택
                    const savedStoreId = localStorage.getItem('selectedStoreId');
                    if (savedStoreId) {
                        const savedStore = response.data.data.find(store => store.storeId === savedStoreId);
                        if (savedStore) {
                            setSelectedStore(savedStore);
                        }
                    }
                } else {
                    setError(response.data.message || '매장 정보를 불러오는데 실패했습니다.');
                }
            } catch (error) {
                console.error('매장 정보 조회 실패:', error);
                setError('매장 정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, [adminId]);

    //  이 줄 추가  11-21
    const handleStoreSelect = async (store) => {
        const token = localStorage.getItem('token');
        setSelectedStore(store);
        localStorage.setItem('selectedStoreId', store.storeId);
        
        try {
            const response = await axios.get(
                `http://localhost:8080/ROOT/api/orders/items/groupedByStore/${store.storeId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );
            // 주문 데이터 처리
            console.log(response.data);
        } catch (error) {
            console.error('주문 데이터 조회 실패:', error);
        }
    };

    if (loading) return <div className="p-4 text-center">로딩중...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">관리 매장 목록</h2>
            
            {stores.length > 0 ? (
                <div className="space-y-4">
                    {stores.map((store) => (
                        <div 
                            key={store.storeId}
                            className={`p-4 border rounded cursor-pointer hover:bg-gray-50 
                                ${selectedStore?.storeId === store.storeId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                            onClick={() => handleStoreSelect(store)}
                        >
                            <h3 className="font-bold">{store.storeName}</h3>
                            <p className="text-sm text-gray-600">{store.address}</p>
                            <p className="text-sm text-gray-600">연락처: {store.phone}</p>
                            <p className="text-sm text-gray-600">
                                상태: {store.isActive ? '영업중' : '영업종료'}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">등록된 매장이 없습니다.</p>
            )}
        </div>
    );
}

export default StoreSelector;