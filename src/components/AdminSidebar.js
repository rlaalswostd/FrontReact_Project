// src/components/AdminSidebar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminSidebar.css';  // AdminSidebar 전용 CSS 파일
import LogoImage from '../assets/images/port_repair.png'

function AdminSidebar({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem('token');   // 토큰 제거
    localStorage.removeItem('adminId');    // adminid 제거
    localStorage.removeItem('role');      // 역할 정보 제거 등 필요한 데이터 제거

    setIsAuthenticated(false);
    navigate('/');
    alert("로그아웃 되었습니다.")
  };

  return (
    <nav className="admin-sidebar">
      <img src={LogoImage} alt="Admin Logo" className="sidebar-logo" />
      <ul>
        <li className={location.pathname === `/admin/users` ? 'active' : ''}><Link to="/admin/users"><i className="fa fa-list" aria-hidden="true" style={{ marginRight: '6px' }}></i>대시보드</Link></li>
        <li className={location.pathname === `/admin/notice` ? 'active' : ''}><Link to="/admin/notice"><i className="fa fa-bullhorn" aria-hidden="true" style={{ marginRight: '6px' }}></i>공지사항</Link></li>
        <li className={location.pathname === `/admin/register` ? 'active' : ''}><Link to="/admin/register"><i className="fa fa-id-card-o" aria-hidden="true" style={{ marginRight: '5px' }}></i>계정 등록</Link></li>
        <li className={location.pathname === `/admin/shop` ? 'active' : ''}><Link to="/admin/shop"><i className="fa fa-id-card-o" aria-hidden="true" style={{ marginRight: '5px' }}></i>매장 등록</Link></li>
      </ul>
      <button className="logout-button" onClick={handleLogout}>로그아웃</button>
    </nav>
  );
}

export default AdminSidebar;
