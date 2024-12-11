import React, { useState, useEffect } from 'react';
import './ManagerCategoryNew.css';
import axios from 'axios';
import { useParams , useNavigate} from 'react-router-dom'; // useParams만 사용

const ManagerMenuNew = () => {
    
    const { storeId } = useParams(); // storeId를 URL 경로에서 추출
    const [name, setName] = useState(''); // 메뉴 이름
    const [categoryList, setCategoryList] = useState([]);  // 카테고리 목록
    const [newCategory, setNewCategory] = useState('');  // 선택된 카테고리 (cname)
    const [price, setPrice] = useState(''); // 메뉴 가격
    const [isAvailable, setIsAvailable] = useState(true); // 사용 가능 여부
    const [imageFile, setImageFile] = useState(null); // 이미지 파일
    const [message, setMessage] = useState(''); // 서버 응답 메시지
    const [loading, setLoading] = useState(false); // 로딩 상태 (폼 전송 중)
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



    // API 기본 URL (서버의 루트 경로 설정)
    const API_BASE_URL = 'http://localhost:8080/ROOT';

    useEffect(() => {
        const checkTokenAndLoadData = async () => {
            const token = localStorage.getItem('token');

            if (!token || !storeId) {
                setMessage('로그인 정보가 없습니다. 로그인 후 다시 시도해주세요.');
                window.location.href = '/login';
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/api/category/store/${storeId}/list`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.status === 200) {
                    setCategoryList(response.data.data);
                } else {
                    setMessage('카테고리 목록을 불러오는 데 실패했습니다.');
                    alert('카테고리 목록을 불러오는 데 실패했습니다.');
                }
            } catch (error) {
                console.error('Error:', error);
                if (error.response?.status === 401 || error.response?.data?.message?.includes('토큰')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('storeId');
                    alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                    window.location.href = '/login';
                } else {
                    setMessage('카테고리 목록을 불러오는 중 오류가 발생했습니다.');
                }
            }
        };

        checkTokenAndLoadData();
    }, [storeId]); // storeId 변경 시 카테고리 다시 로드

    // 이미지 파일 선택 처리 함수
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('Selected file:', file.name, file.type, file.size);
            setImageFile(file);
        }
    };

    // 유효성 검사 함수
    const validateForm = () => {
        if (!name.trim()) {
            setMessage('메뉴 이름을 입력하세요.');
            return false;
        }
        if (!newCategory) {
            setMessage('카테고리를 선택하세요.');
            return false;
        }
        if (!price || parseFloat(price) < 0) {
            setMessage('가격을 올바르게 입력하세요.');
            return false;
        }
        return true;
    };

    // 폼 제출 처리 함수
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token || !storeId) {
            setMessage('로그인이 필요합니다.');
            window.location.href = '/login';
            return;
        }

        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('cname', newCategory.trim());
        formData.append('price', price);
        formData.append('isAvailable', isAvailable);

        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/menu/store/${storeId}/register`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    withCredentials: true
                }
            );

            console.log('전송 데이터:', formData);
            console.log('응답:', response.data);

            if (response.data.status === 200) {
                setMessage('메뉴가 성공적으로 등록되었습니다!');
                // 폼 초기화
                setName('');
                setNewCategory('');
                setPrice('');
                setImageFile(null);
                setIsAvailable(true);
            } else {
                setMessage(`오류: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error details:', error.response || error);
            const errorResponse = error.response?.data;

            if (errorResponse?.message?.includes('토큰') ||
                error.response?.status === 401 ||
                error.response?.status === 403) {
                console.log('토큰 에러:', errorResponse);
                setMessage('인증에 실패했습니다. 다시 로그인해주세요.');
                setTimeout(() => {
                    window.location.href = '/manager/login';
                }, 1500);
            } else {
                const errorMessage = errorResponse?.message || error.message;
                setMessage(`오류 : ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='MCN-container'>
            <div className='MCN-main'>메뉴 등록</div>
            <form onSubmit={handleSubmit} className="MCN-form2">
                <div className='MCN-form-group'>
                    <label className="MCN-label">메뉴 이름</label>
                    <input 
                        className='MCN-input'
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className='MCN-form-group'>
                    <label className="MCN-label">카테고리 선택</label>
                    <select
                        className="custom-select"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    >
                        <option value="">클릭해서 선택하세요</option>
                        {categoryList.map((category) => (
                            <option key={category.cname} value={category.cname}>
                                {category.cname}
                            </option>
                        ))}
                    </select>
                </div>

                <div className='MCN-form-group'>
                    <label className="MCN-label">가격</label>
                    <input 
                        className='MCN-input'
                        type="number"
                        min="0"
                        step="100"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>

                <label className="MCN-check">
                    <div className='MCN-form-group'>
                        <input 
                            className='MCN-input-check'
                            type="checkbox"
                            checked={isAvailable}
                            onChange={(e) => setIsAvailable(e.target.checked)}
                        />
                        사용가능
                    </div>
                </label>

                <div className='MCN-image-group'>
                    <label className="Menu-image">메뉴 이미지 :</label>
                    <label className="file-label">
                        파일 선택
                        <input
                            className="file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </label>
                    <span className="file-status">
                        {imageFile ? imageFile.name : "선택된 파일이 없음"}
                    </span>
                </div>

                <button type="submit" disabled={loading} className="MCN-button2">
                    {loading ? '등록 중...' : '메뉴 등록'}
                </button>
            </form>

            {message && <p className='MMN-success'>{message}</p>}
        </div>
    );
};

export default ManagerMenuNew;
