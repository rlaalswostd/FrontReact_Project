// src/components/ManagerSidebar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoImage from '../assets/images/port_repair.png';
import './ManagerSidebar.css'; // ManagerSidebar 전용 CSS 파일

function ManagerSidebar({ setIsAuthenticated }) {

  const navigate = useNavigate();
  const location = useLocation();
  const storeId = localStorage.getItem('storeId');

  const handleLogout = () => {
    // LocalStorage에서 인증 정보 제거
    localStorage.removeItem('token');  // 토큰 제거
    localStorage.removeItem('storeId');   // 선택된 매장 ID 제거
    localStorage.removeItem('adminId');    // adminid 제거
    localStorage.removeItem('storeName');  // storename 제거
    localStorage.removeItem('role');      // 역할 정보 제거 등 필요한 데이터 제거

    setIsAuthenticated(false); // 인증 상태를 비인증으로 설정
    navigate('/'); // 로그인 페이지로 이동
    alert("로그아웃 되었습니다.");
  };


  // 사이드바에 storeid 들어감 
  const handleRefresh = () => {
    // 로컬스토리지에서 토큰을 가져와서 API 호출에 포함시킴
    const token = localStorage.getItem('token');
    const storeId = localStorage.getItem('storeId');

    if (!storeId) {
      alert("error 확인");
      return;
    }

    fetch('http://127.0.0.1:8080/ROOT/api/orders/items/groupedByStore/{storeId}', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // 토큰을 헤더에 추가
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        // 데이터 처리 (새로고침된 데이터로 상태 업데이트 등)
        console.log('새로고침된 데이터:', data);
        navigate('/manager/orders');
        // 예시: 상태 업데이트로 UI 갱신
      })
      .catch(error => {
        console.error('데이터 새로고침 실패:', error);
      });
  };

  return (
    <nav className="manager-sidebar">
      <img src={LogoImage} alt="Manager Logo" className="sidebar-logo" />
      <ul>
        {/* 링크 managerapp.js 까지 고칠것 */}
        <li className={location.pathname === `/manager/notice/${storeId}` ? 'active' : ''}><Link to={`/manager/notice/${storeId}`}><i className="fa fa-gavel" aria-hidden="true" style={{ marginRight: '4px' }}></i>공지사항</Link></li>
        <li className={location.pathname === `/manager/orders/${storeId}` ? 'active' : ''}><Link to={`/manager/orders/${storeId}`}><i className="fa fa-desktop" aria-hidden="true" style={{ marginRight: '4px' }}></i>주문보기</Link></li>
        <li className={location.pathname === `/manager/categorynew/${storeId}` ? 'active' : ''}><Link to={`/manager/categorynew/${storeId}`}><i className="fa fa-pencil-square-o" aria-hidden="true" style={{ marginRight: '4px' }}></i>카테고리 등록</Link></li>
        <li className={location.pathname === `/manager/category/${storeId}` ? 'active' : ''}><Link to={`/manager/category/${storeId}`}><i className="fa fa-cog" aria-hidden="true" style={{ marginRight: '4px' }}></i>카테고리 관리</Link></li>
        <li className={location.pathname === `/manager/menunew/${storeId}` ? 'active' : ''}><Link to={`/manager/menunew/${storeId}`}><i className="fa fa-pencil-square-o" aria-hidden="true" style={{ marginRight: '4px' }}></i>메뉴 등록</Link></li>
        <li className={location.pathname === `/manager/menu/${storeId}` ? 'active' : ''}><Link to={`/manager/menu/${storeId}`}><i className="fa fa-cog" aria-hidden="true" style={{ marginRight: '4px' }}></i>메뉴 관리</Link></li>
        <li className={location.pathname === `/manager/settings/${storeId}` ? 'active' : ''}><Link to={`/manager/settings/${storeId}`}><i className="fa fa-krw" aria-hidden="true" style={{ marginRight: '4px' }}></i>결제내역</Link></li>
        <li className={location.pathname === `/manager/tables/${storeId}` ? 'active' : ''}><Link to={`/manager/tables/${storeId}`}><i className="fa fa-pencil-square-o" aria-hidden="true" style={{ marginRight: '4px' }}></i>테이블 등록</Link></li>
        <li className={location.pathname === `/manager/tablesput/${storeId}` ? 'active' : ''}><Link to={`/manager/tablesput/${storeId}`}><i className="fa fa-cog" aria-hidden="true" style={{ marginRight: '4px' }}></i>테이블 관리</Link></li>
      </ul>

      <h1>Select Market<br /> {storeId && localStorage.getItem('storeName')
        ? localStorage.getItem('storeName')
        : '매장이 선택되지 않았습니다.'}</h1>
      <button className="logout-button" onClick={handleLogout}>로그아웃</button>
    </nav>
  );
}

export default ManagerSidebar;