import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { adminJoinActionAPI } from "../../Utils/api";

/* ===============================
   Notification Badge
================================= */
export const NotificationBadge = ({ count, className = "" }) => {
    if (!count) return null;

    return (
        <div className={`absolute -top-1 -right-1 w-5 h-5 text-[10px]
      bg-red-500 text-white rounded-full flex items-center
      justify-center font-bold animate-pulse ${className}`}>
            {count > 99 ? "99+" : count}
        </div>
    );
};

/* ===============================
   Join Request Popup
================================= */
const JoinRequestPopup = ({ request, onAccept, onReject }) => {
    if (!request) return null;

    return (
        <div className="fixed bottom-6 right-6 bg-white shadow-xl rounded-xl p-4 w-80 z-50">
            <h4 className="font-bold mb-2">Join Request</h4>

            <p className="text-sm mb-3">
                <b>User ID:</b> {request.user_id}
                <br />
                <span className="text-gray-500">
                    Room ID: {request.room_id}
                </span>
            </p>

            <div className="flex gap-2">
                <button
                    onClick={() => onAccept(request)}
                    className="flex-1 bg-green-500 text-white rounded-lg py-1"
                >
                    Accept
                </button>
                <button
                    onClick={() => onReject(request)}
                    className="flex-1 bg-red-500 text-white rounded-lg py-1"
                >
                    Reject
                </button>
            </div>
        </div>
    );
};

/* ===============================
   Admin Notifications
================================= */
const AdminNotifications = () => {
    const socketRef = useRef(null);
    const [count, setCount] = useState(0);
    const [active, setActive] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        if (!userId) return;

        socketRef.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/notifications/${userId}/`
        );

        socketRef.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === "join_request") {
                setActive(data);
                setCount((c) => c + 1);
            }
        };

        return () => socketRef.current?.close();
    }, []);

    const accept = async (req) => {
        try {
            await adminJoinActionAPI(req.room_id, req.user_id, "approve");
        } catch (e) {
            alert("Failed to approve request");
        }
        clear();
    };

    const reject = async (req) => {
        try {
            await adminJoinActionAPI(req.room_id, req.user_id, "reject");
        } catch (e) {
            alert("Failed to reject request");
        }
        clear();
    };

    const clear = () => {
        setActive(null);
        setCount((c) => Math.max(c - 1, 0));
    };

    return (
        <>
            <div className="relative cursor-pointer">
                <Bell size={22} />
                <NotificationBadge count={count} />
            </div>

            <JoinRequestPopup
                request={active}
                onAccept={accept}
                onReject={reject}
            />
        </>
    );
};

export default AdminNotifications;
