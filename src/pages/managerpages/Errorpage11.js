import React from 'react';
import { useNavigate } from 'react-router-dom';
import errorImage from '../../assets/images/errorpage1.png';
import './Errorpage11.css';

const Errorpage11 = () => {
    const navigate = useNavigate();

    // const handleGoBack = () => {
    //     // 저장된 이전 유효 경로 배열 가져오기
    //     const lastValidPaths = JSON.parse(localStorage.getItem('lastValidPaths')) || [];

    //     // 현재 잘못된 경로를 제거
    //     lastValidPaths.pop();

    //     // 수정된 배열을 다시 localStorage에 저장
    //     localStorage.setItem('lastValidPaths', JSON.stringify(lastValidPaths));

    //     // 이전 유효 경로로 이동
    //     if (lastValidPaths.length > 0) {
    //         navigate(lastValidPaths[lastValidPaths.length - 1]);
    //     }
    //     else {
    //         // 만약 저장된 경로가 없다면 기본적으로 /manager로 이동
    //         navigate('/manager');
    //     }
    // };

    return (
        <div className="error-con">
            <img className="errorimage" src={errorImage} alt="Error Page" />
            <div className="error-content">
                <div className="error-title">잘못된 접근입니다.</div>
                <div className="error-text">이 페이지에 접근할 수 없습니다. 뒤로 가기 또는 로그인 화면으로 이동하세요.</div>
                {/* <button className="errorback" onClick={handleGoBack}>뒤로 가기</button> */}
                <button className="errorback" onClick={() => navigate('/manager-login')} >
                    로그인 화면으로 이동
                </button>
            </div>
        </div>
    );
};




export default Errorpage11;
