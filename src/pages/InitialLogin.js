import React from 'react';
import { Link } from 'react-router-dom';
import './Login.css';
import Logo from '../assets/images/port_repair.png';

function InitialLogin() {
    return (
        <div className="first-open">
            <img src={Logo} alt="Admin Logo" className="initiallogin-image" />
            <div className="login-up">
                <div className="login-option">
                    <Link to="/admin-login" className="login-button-admin">
                        <p>관리자 로그인</p>
                    </Link>
                </div>
                <div className="login-option">
                    <Link to="/manager-login" className="login-button-manager">
                        <p>사장님 로그인</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default InitialLogin;
