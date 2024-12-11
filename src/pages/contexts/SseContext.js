// import { createContext, useContext, useEffect, useState, useCallback } from "react";
// import { EventSourcePolyfill } from 'event-source-polyfill';
// //2
// const SseContext = createContext();

// export function SseProvider({ children }) {
//     const [notifications, setNotifications] = useState({
//         orders: [],
//         notices: []
//     });
//     const [eventSource, setEventSource] = useState(null);
//     const [isConnected, setIsConnected] = useState(false);

//     const connectSSE = useCallback(() => {  // useCallback 추가
//         const token = localStorage.getItem('token');
//         if (!token) return;

//         const newEventSource = new EventSourcePolyfill(
//             'http://localhost:8080/ROOT/api/sse/connect',
//             {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 }
//             }
//         );


//         newEventSource.onopen = () => {
//             console.log('SSE 연결 성공');
//             setIsConnected(true);
//         };

//         newEventSource.onmessage = (event) => {
//             const data = JSON.parse(event.data);
//             const role = localStorage.getItem('role');

//             console.log('SSE 메세지 수신:', {
//                 data,
//                 role,
//                 type: data.type
//             });

//             switch (data.type) {
//                 case 'ORDER':
//                     if (role === 'STORE_ADMIN') {
//                         setNotifications(prev => ({
//                             ...prev,
//                             orders: [...prev.orders, data]
//                         }));
//                     }
//                     break;
//                 case 'NOTICE':
//                     if (role === 'STORE_ADMIN' || role === 'SUPER_ADMIN') {
//                         setNotifications(prev => ({
//                             ...prev,
//                             notices: [...prev.notices, data]
//                         }));
//                     }
//                     break;
//                 default:
//                     break;
//             }
//         };

//         newEventSource.onerror = (error) => {
//             console.error('SSE 에러:', error);
//             newEventSource.close();
//             setIsConnected(false);
//             //재연결 시도
//             setTimeout(() => {
//                 console.log('SSE 재연결 시도...');
//                 connectSSE();
//             }, 1000); //1초 후 재연결 시도
//         };

//         setEventSource(newEventSource);
//     }, []); //useCallback 종료

//     const disconnect = () => {
//         if (eventSource) {
//             eventSource.close();
//             setEventSource(null);
//             setIsConnected(false);
//             setNotifications({ orders: [], notices: [] });
//         }
//     };
//     // 재연결 시도
//     useEffect(() => {
//         connectSSE();

//         return () => {
//             disconnect();
//         };
//     }, [connectSSE]);
//     //토큰 변경 감지하여 재연결 시도함

//     useEffect(() => {
//         const handleStorageChange = (e) => {
//             if (e.key === 'token') {
//                 disconnect();
//                 connectSSE();
//             }
//         };

//         window.addEventListener('storage', handleStorageChange);
//         return () => {
//             window.removeEventListener('storage', handleStorageChange);
//         };
//     }, [connectSSE]);

//     return (
//         <SseContext.Provider value={{
//             notifications,
//             connectSSE,
//             disconnect,
//             isConnected
//         }}>
//             {children}
//         </SseContext.Provider>
//     );
// }

// export const useSse = () => useContext(SseContext);