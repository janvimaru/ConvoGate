

import { useEffect, useRef, useState, useCallback } from "react";
import { WS_BASE } from "../Utils/constants";

const useWebSocket = (roomId) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.user_id;

    useEffect(() => {
        if (!roomId || !userId) return;

        const connect = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            // Use window.location.hostname to ensure it works on localhost different ports if needed, but hardcoded 127.0.0.1 is fine for now as per previous files
            const ws = new WebSocket(`${WS_BASE}/ws/chat/${roomId}/?user_id=${userId}`);

            console.log(`[useWebSocket] Connecting to Chat Room ${roomId} as User ${userId}`);

            ws.onopen = () => {
                console.log("[useWebSocket] Connected");
                setIsConnected(true);
                socketRef.current = ws;
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("[useWebSocket] Message Received:", data);

                    // Dispatch granular events based on type
                    if (data.type === "chat_message") {
                        window.dispatchEvent(new CustomEvent("chat-message", { detail: data }));
                    } else if (data.type === "user_status") {
                        window.dispatchEvent(new CustomEvent("user-status", { detail: data }));
                    } else if (data.type === "user_typing") {
                        window.dispatchEvent(new CustomEvent("user-typing", { detail: data }));
                    } else if (data.type === "message_reaction") {
                        window.dispatchEvent(new CustomEvent("message-reaction", { detail: data }));
                    } else if (data.type === "message_status_update") {
                        window.dispatchEvent(new CustomEvent("message-status-update", { detail: data }));
                    } else if (data.type === "expense_update") {
                        window.dispatchEvent(new CustomEvent("expense_update_event", { detail: data }));
                    }
                } catch (e) {
                    console.error("[useWebSocket] Error parsing message:", e);
                }
            };

            ws.onclose = () => {
                console.warn("[useWebSocket] Disconnected. Reconnecting in 2s...");
                setIsConnected(false);
                setTimeout(connect, 2000);
            };

            ws.onerror = (err) => {
                console.error("[useWebSocket] Error:", err);
                ws.close();
            };
        };

        connect();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [roomId, userId]);

    const sendMessage = useCallback((payload) => {
        if (!socketRef.current || socketRef.current.readyState !== 1) return false;

        // Simple passthrough for flexible payloads (action, content, message_type, etc.)
        socketRef.current.send(JSON.stringify(payload));
        return true;
    }, []);

    return { isConnected, sendMessage };
};

export default useWebSocket;
