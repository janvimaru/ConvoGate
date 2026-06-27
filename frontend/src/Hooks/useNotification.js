// import { useState, useEffect, useCallback } from 'react';
// import { notificationAPI } from '../Utils/api';

// const useNotifications = () => {
//     const [notifications, setNotifications] = useState([]);
//     const [unreadCount, setUnreadCount] = useState(0);
//     const [isLoading, setIsLoading] = useState(false);

//     const fetchNotifications = useCallback(async () => {
//         try {
//             setIsLoading(true);
//             const response = await notificationAPI.getNotifications();
//             setNotifications(response.data);
//         } catch (error) {
//             console.error('Error fetching notifications:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     }, []);

//     const fetchUnreadCount = useCallback(async () => {
//         try {
//             const response = await notificationAPI.getUnreadCount();
//             setUnreadCount(response.data.count);
//         } catch (error) {
//             console.error('Error fetching unread count:', error);
//         }
//     }, []);

//     const markAsRead = useCallback(async (notificationId) => {
//         try {
//             await notificationAPI.markAsRead(notificationId);
//             setNotifications(prev =>
//                 prev.map(notif =>
//                     notif.id === notificationId ? { ...notif, unread: false } : notif
//                 )
//             );
//             setUnreadCount(prev => Math.max(0, prev - 1));
//         } catch (error) {
//             console.error('Error marking notification as read:', error);
//         }
//     }, []);

//     const markAllAsRead = useCallback(async () => {
//         try {
//             await notificationAPI.markAllAsRead();
//             setNotifications(prev =>
//                 prev.map(notif => ({ ...notif, unread: false }))
//             );
//             setUnreadCount(0);
//         } catch (error) {
//             console.error('Error marking all notifications as read:', error);
//         }
//     }, []);

//     const handleJoinRequest = useCallback(async (requestId, action) => {
//         try {
//             if (action === 'accept') {
//                 await notificationAPI.acceptJoinRequest(requestId);
//             } else {
//                 await notificationAPI.rejectJoinRequest(requestId);
//             }
//             // Remove the notification after action
//             setNotifications(prev => prev.filter(notif => notif.id !== requestId));
//         } catch (error) {
//             console.error('Error handling join request:', error);
//         }
//     }, []);

//     // Poll for new notifications every 30 seconds
//     useEffect(() => {
//         fetchNotifications();
//         fetchUnreadCount();

//         const interval = setInterval(() => {
//             fetchNotifications();
//             fetchUnreadCount();
//         }, 30000);

//         return () => clearInterval(interval);
//     }, [fetchNotifications, fetchUnreadCount]);

//     return {
//         notifications,
//         unreadCount,
//         isLoading,
//         markAsRead,
//         markAllAsRead,
//         handleJoinRequest,
//         refresh: fetchNotifications
//     };
// };

// export default useNotifications;

import { useEffect, useRef, useState } from "react";

export const useWebSocket = (wsUrl, onMessage) => {
    const ws = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!wsUrl) return;

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {

            setConnected(true);
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onMessage(data);
        };

        ws.current.onerror = (error) => {
            console.error("WS error", error);
        };

        ws.current.onclose = (event) => {
            console.warn("❌ WS disconnected", event);
            setConnected(false);

            // Optional: auto-reconnect after 3 seconds
            setTimeout(() => {
                ws.current = new WebSocket(wsUrl);
            }, 3000);
        };

        return () => {
            ws.current.close();
        };
    }, [wsUrl, onMessage]);

    const sendMessage = (data) => {
        if (connected && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(data));
        } else {
            console.warn("WS not connected, cannot send message");
        }
    };

    return { connected, sendMessage };
};
