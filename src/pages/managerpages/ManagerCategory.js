import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ManagerCategory.css';

const ManagerCategory = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [storeName, setStoreName] = useState('');
    const [categoryList, setCategoryList] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [newDisplayOrder, setNewDisplayOrder] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const API_BASE_URL = 'http://localhost:8080/ROOT/api/category';

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

    // 카테고리 목록 조회
    useEffect(() => {
        if (storeId) {
            axios.get(`${API_BASE_URL}/store/${storeId}/list`)
                .then(response => {
                    if (response.data.status === 200) {
                        setCategoryList(response.data.data);
                    } else {
                        // 카테고리 목록 조회 실패 시, 바로 리디렉션하고 alert 중복 방지
                        console.error('카테고리 목록 조회 실패:', response.data.message);
                        navigate('/Errorpage11'); // 에러 페이지로 바로 이동
                    }
                })
                .catch(error => {
                    // 오류 발생 시, alert 표시 없이 바로 리디렉션
                    console.error('카테고리 목록 조회 중 오류:', error);
                    navigate('/Errorpage11'); // 에러 페이지로 바로 이동
                });
        }
    }, [storeId, navigate]);

    // 카테고리 수정
    const handleEditCategory = (category) => {
        setSelectedCategory(category);
        setNewCategory(category.cname);
        setNewDisplayOrder(category.displayOrder);
    };

    const handleUpdateCategory = async () => {
        if (!newCategory || !newDisplayOrder) {
            alert('모든 필드를 입력하세요.');
            return;
        }

        // 카테고리 이름 중복 체크
        const existingCategory = categoryList.find(
            category => category.cname === newCategory && category.categoryId !== selectedCategory.categoryId
        );

        if (existingCategory) {
            alert('이미 사용 중인 카테고리 이름입니다.');
            return;
        }

        // 입력된 displayOrder가 이미 사용 중인지 확인
        const conflictingCategory = categoryList.find(
            category => category.displayOrder === parseInt(newDisplayOrder, 10)
        );

        if (conflictingCategory && conflictingCategory.categoryId !== selectedCategory.categoryId) {
            // 기존 카테고리와 순서를 교환
            axios.put(`${API_BASE_URL}/store/${storeId}/update/${conflictingCategory.categoryId}`, {
                cname: conflictingCategory.cname,
                displayOrder: selectedCategory.displayOrder
            })
                .then(() => {
                    // 현재 카테고리 업데이트
                    return axios.put(`${API_BASE_URL}/store/${storeId}/update/${selectedCategory.categoryId}`, {
                        cname: newCategory,
                        displayOrder: newDisplayOrder
                    });
                })
                .then(() => {
                    alert('카테고리가 성공적으로 수정되었습니다.');

                    // 상태 업데이트
                    setCategoryList(prevList => {
                        const updatedList = prevList.map(category => {
                            if (category.categoryId === selectedCategory.categoryId) {
                                return { ...category, cname: newCategory, displayOrder: parseInt(newDisplayOrder, 10) };
                            } else if (category.categoryId === conflictingCategory.categoryId) {
                                return { ...category, displayOrder: selectedCategory.displayOrder };
                            }
                            return category;
                        });

                        // displayOrder 기준으로 정렬
                        return updatedList.sort((a, b) => a.displayOrder - b.displayOrder);
                    });

                    // 상태 초기화
                    setSelectedCategory(null);
                    setNewCategory('');
                    setNewDisplayOrder('');
                })
                .catch(error => {
                    console.error('카테고리 순서 교환 및 수정 실패:', error);
                    alert('카테고리 수정 중 오류가 발생했습니다.');
                });
        } else {
            // 순서 중복 없으면 일반적인 수정 로직 실행
            axios.put(`${API_BASE_URL}/store/${storeId}/update/${selectedCategory.categoryId}`, {
                cname: newCategory,
                displayOrder: newDisplayOrder
            })
                .then(response => {
                    if (response.data.status === 200) {
                        alert('카테고리가 성공적으로 수정되었습니다.');

                        // 상태 업데이트
                        setCategoryList(prevList => {
                            const updatedList = prevList.map(category =>
                                category.categoryId === selectedCategory.categoryId
                                    ? { ...category, cname: newCategory, displayOrder: parseInt(newDisplayOrder, 10) }
                                    : category
                            );

                            // displayOrder 기준으로 정렬
                            return updatedList.sort((a, b) => a.displayOrder - b.displayOrder);
                        });

                        // 상태 초기화
                        setSelectedCategory(null);
                        setNewCategory('');
                        setNewDisplayOrder('');
                    } else {
                        alert('카테고리 수정 실패: ' + response.data.message);
                    }
                })
                .catch(error => {
                    console.error('카테고리 수정 실패:', error);
                    alert('카테고리 수정 중 오류가 발생했습니다.');
                });
        }
    };

    // 수정 취소
    const handleCancelEdit = () => {
        setSelectedCategory(null);
        setNewCategory('');
        setNewDisplayOrder('');
    };

    // 카테고리 삭제 후 display_order 갱신
    const handleDeleteCategory = (categoryId) => {
        const confirmDelete = window.confirm('정말로 삭제하시겠습니까?');
        if (confirmDelete) {
            // 삭제할 카테고리 찾기
            const categoryToDelete = categoryList.find(category => category.categoryId === categoryId);
            if (categoryToDelete) {
                // 서버에 삭제 요청
                axios.delete(`${API_BASE_URL}/store/${storeId}/delete/${categoryId}`)
                    .then(response => {
                        if (response.data.status === 200) {
                            alert('카테고리가 성공적으로 삭제되었습니다.');

                            // 삭제 후 display_order 갱신
                            const updatedList = categoryList
                                .filter(category => category.categoryId !== categoryId)  // 삭제된 카테고리 제외
                                .map(category => {
                                    if (category.displayOrder > categoryToDelete.displayOrder) {
                                        return { ...category, displayOrder: category.displayOrder - 1 }; // 순서 내리기
                                    }
                                    return category;
                                });

                            setCategoryList(updatedList);  // 상태 업데이트

                            // 서버에 갱신된 display_order 전송
                            updatedList.forEach(category => {
                                axios.put(`${API_BASE_URL}/store/${storeId}/update/${category.categoryId}`, {
                                    cname: category.cname,
                                    displayOrder: category.displayOrder
                                })
                                    .catch(error => {
                                        console.error('카테고리 display_order 업데이트 실패:', error);
                                        alert('카테고리 순서 업데이트 중 오류가 발생했습니다.');
                                    });
                            });
                        } else {
                            alert('카테고리 삭제 실패 (해당 카테고리를 사용하고 있는 메뉴가 있는지 확인하세요)  ');
                        }
                    })
                    .catch(error => {
                        console.error('카테고리 삭제 실패:', error);
                        alert('카테고리 삭제 중 오류가 발생했습니다.');
                    });
            }
        }
    };

    return (
        <div className='category-con'>
            <div className='category-title'>카테고리 관리</div>

            {/* 카테고리 목록 */}
            <div>
                <div className='category-list'><i className="fa fa-bookmark" style={{ marginRight: '8px' }}></i>카테고리 목록</div>
                {categoryList.length > 0 ? (
                    <div className='cate-num'>
                        {categoryList.map(category => (
                            <div className='cate-num1' key={category.categoryId}>
                                <span> <i className="fa fa-check-square-o" aria-hidden="true" style={{ marginRight: '3px' }}></i> {category.cname}  (순서: {category.displayOrder})</span>
                                <div className='catebtn'>
                                    <button className='catebtn-upd' onClick={() => handleEditCategory(category)}>수정</button>
                                    <button className='catebtn-del' onClick={() => handleDeleteCategory(category.categoryId)}>삭제</button>
                                </div>
                                {/* 카테고리 수정 폼 */}
                                {selectedCategory && selectedCategory.categoryId === category.categoryId && (
                                    <div className='cate-edit-form'>
                                        <input className='cate-edit'
                                            type="text"
                                            placeholder="카테고리 이름"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                        />
                                        <input className='cate-edit'
                                            type="number"
                                            placeholder="표시 순서"
                                            value={newDisplayOrder}
                                            onChange={(e) => setNewDisplayOrder(e.target.value)}
                                        />
                                        <button className='catebtn-upd2' onClick={handleUpdateCategory}>수정</button>
                                        <button className='catebtn-del' onClick={handleCancelEdit}>취소</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>등록된 카테고리가 없습니다. 새로운 카테고리를 등록해주세요.</p>
                )}
            </div>


        </div>
    );
};

export default ManagerCategory;
