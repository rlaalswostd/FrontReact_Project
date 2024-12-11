import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

const OrderNotification = forwardRef((props, ref) => {
    const audioRef = useRef(null);
    const audioContext = useRef(null);

    useEffect(() => {
        // AudioContext 생성
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        
        // 오디오 객체 생성 및 설정
        audioRef.current = new Audio('/sound/OrderSoundGood.mp3');
        audioRef.current.load();

        // 초기에 한 번 사용자 상호작용으로 오디오 컨텍스트 resume
        const handleUserInteraction = () => {
            if (audioContext.current.state === 'suspended') {
                audioContext.current.resume();
            }
        };

        window.addEventListener('click', handleUserInteraction);
        window.addEventListener('touchend', handleUserInteraction);

        return () => {
            window.removeEventListener('click', handleUserInteraction);
            window.removeEventListener('touchend', handleUserInteraction);
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    useImperativeHandle(ref, () => ({
        playNotification: async () => {
            try {
                if (!audioRef.current) {
                    console.error('오디오 객체가 없음');
                    return;
                }

                // AudioContext 상태 확인 및 재시작
                if (audioContext.current.state === 'suspended') {
                    await audioContext.current.resume();
                }

                audioRef.current.currentTime = 0;
                
                // 볼륨 조절 (선택사항)
                audioRef.current.volume = 1.0;

                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => console.log('알림음 재생 성공'))
                        .catch(error => {
                            console.error('알림음 재생 실패:', error);
                            // 재생 실패 시 fallback 처리
                            if (error.name === 'NotAllowedError') {
                                console.log('사용자 상호작용이 필요합니다');
                            }
                        });
                }
            } catch (error) {
                console.error('알림음 재생 중 오류:', error);
            }
        }
    }));

    return (
        <button 
            onClick={() => audioContext.current.resume()} 
            style={{ display: 'none' }}
        >
            Start Audio
        </button>
    );
});

export default OrderNotification;