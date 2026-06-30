import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { WS_BASE } from "../Utils/constants";

//    🔢 Notification Badge (UNCHANGED)
const NotificationBadge = ({ count, size = "md" }) => {
    if (!count) return null;

    const sizeClasses = {
        sm: "w-5 h-5 text-xs",
        md: "w-6 h-6 text-xs",
        lg: "w-7 h-7 text-sm",
    };

    return (
        <div
            className={`absolute -top-1 -right-1 ${sizeClasses[size]}
            bg-red-500 text-white rounded-full flex items-center
            justify-center font-bold animate-pulse`}
        >
            {count > 99 ? "99+" : count}
        </div>
    );
};

/* ===============================
   🔔 Join Request Popup (UNCHANGED UI)
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
   🔔 GLOBAL ADMIN NOTIFICATIONS
================================= */
const AdminNotifications = () => {
    const socketRef = useRef(null);

    const [count, setCount] = useState(0);
    const [requests, setRequests] = useState([]);
    const [active, setActive] = useState(null);

    /* ---------------------------
       WebSocket (USER-SCOPED)
    ---------------------------- */
    useEffect(() => {
        const userId = localStorage.getItem("user_id");

        if (!userId) {
            console.error("Admin user_id not found in localStorage");
            return;
        }

        socketRef.current = new WebSocket(
            `${WS_BASE}/ws/notifications/?user_id=${userId}`
        );

        socketRef.current.onopen = () => {

        };

        socketRef.current.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === "join_request") {
                setRequests((prev) => [...prev, data]);
                setActive(data);
                setCount((c) => c + 1);
            }
        };

        socketRef.current.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        return () => socketRef.current?.close();
    }, []);

    /* ---------------------------
       Approve Join
    ---------------------------- */
    const accept = async (req) => {
        try {
            await fetch("/api/member/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    action: "approve_join",
                    room_id: req.room_id,
                    user_id: req.user_id,
                }),
            });
        } catch (err) {
            console.error("Approve failed", err);
        }

        clear(req);
    };

    /* ---------------------------
       Reject Join
    ---------------------------- */
    const reject = async (req) => {
        try {
            await fetch("/api/member/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    action: "reject_join",
                    room_id: req.room_id,
                    user_id: req.user_id,
                }),
            });
        } catch (err) {
            console.error("Reject failed", err);
        }

        clear(req);
    };

    /* ---------------------------
       Clear Notification
    ---------------------------- */
    /* ---------------------------
       Clear Notification
    ---------------------------- */
    const clear = (req) => {
        // Remove processed request
        const remaining = requests.filter((x) => x !== req);
        setRequests(remaining);

        // If there are more requests, set next one active
        if (remaining.length > 0) {
            setActive(remaining[0]);
        } else {
            setActive(null);
        }

        setCount((c) => Math.max(c - 1, 0));
    };

    return (
        <>
            {/* 🔔 Bell Icon */}
            <div className="relative cursor-pointer">
                <Bell size={22} />
                <NotificationBadge count={count} />
            </div>

            {/* 🔔 Join Request Popup */}
            <JoinRequestPopup
                request={active}
                onAccept={accept}
                onReject={reject}
            />
        </>
    );
};

export default AdminNotifications;
