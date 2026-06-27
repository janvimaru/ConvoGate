import React, { useEffect, useState } from "react";
import { MessageSquare, Users, Plus, ChevronRight, LogIn, Moon, Sun } from "lucide-react";
import RoomCard from "../UI/RoomCard";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchSidebarAPI } from "../../Utils/api";
import CreateGroupModal from "../Modals/CreateGroupModal";

const Sidebar = ({ isOpen, onClose }) => {
    const [activeSection, setActiveSection] = useState("joined");
    const [joinedRooms, setJoinedRooms] = useState([]);
    const [createdRooms, setCreatedRooms] = useState([]);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false); // Kept for future use
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    /* =========================
       FETCH SIDEBAR ROOMS
    ========================= */
    const fetchSidebarRooms = async () => {
        setIsLoading(true);
        try {
            const res = await fetchSidebarAPI();
            const data = res.data;

            if (data.success) {
                setJoinedRooms(
                    data.joined.map((r) => ({
                        id: r.id,
                        name: r.name,
                        is_quick_chat: r.is_quick_chat,
                        is_saved: r.is_saved || r.is_archived, // Allow for backend variations
                        status: r.status,
                        is_read_only: r.is_read_only,
                        expiry_time: r.expiry_time,
                        unread: r.unread_count || 0,
                        lastMessage: r.last_message || "",
                        time: r.last_message_time ? new Date(r.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
                    }))
                );

                setCreatedRooms(
                    data.created.map((r) => ({
                        id: r.id,
                        name: r.name,
                        is_quick_chat: r.is_quick_chat,
                        is_saved: r.is_saved || r.is_archived,
                        status: r.status,
                        is_read_only: r.is_read_only,
                        expiry_time: r.expiry_time,
                        unread: r.unread_count || 0,
                        lastMessage: r.last_message || "",
                        time: r.last_message_time ? new Date(r.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
                    }))
                );
            }
        } catch (err) {
            console.error("Sidebar load failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const location = useLocation();
    const activeRoomId = location.pathname.startsWith("/chat/") ? location.pathname.split("/")[2] : null;

    useEffect(() => {
        fetchSidebarRooms();

        const updateRoomList = (data) => {
            const roomId = data.room_id || data.id;
            const updateFn = (prevRooms) => prevRooms.map(room => {
                if (parseInt(room.id) === parseInt(roomId)) {
                    const isRoomActive = activeRoomId && parseInt(activeRoomId) === parseInt(roomId);
                    return {
                        ...room,
                        lastMessage: data.content || data.message || "New message",
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        unread: isRoomActive ? 0 : (room.unread || 0) + (data.type === 'new_message' ? 1 : 0)
                    };
                }
                return room;
            });

            setJoinedRooms(updateFn);
            setCreatedRooms(updateFn);
        };

        const handleChatMessage = (e) => updateRoomList(e.detail);
        const handleNotification = (e) => {
            if (e.detail.type === 'new_message') {
                updateRoomList(e.detail);
            }
        };

        window.addEventListener("chat-message", handleChatMessage);
        window.addEventListener("notification-received", handleNotification);

        return () => {
            window.removeEventListener("chat-message", handleChatMessage);
            window.removeEventListener("notification-received", handleNotification);
        };
    }, [activeRoomId]);

    const rooms = activeSection === "joined" ? joinedRooms : createdRooms;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-80 bg-[var(--sidebar-bg)] border-r border-[var(--border-light)] shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-full md:shadow-none
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="p-5 flex flex-col h-full">

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            onClick={() => navigate("/create-room")}
                            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200"
                            style={{ background: 'var(--gradient-primary)' }}
                        >
                            <Plus className="h-5 w-5" />
                            <span>New</span>
                        </button>

                        <button
                            onClick={() => navigate("/join-room")}
                            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[var(--surface-light)] border border-[var(--border-light)] text-[var(--text-primary)] font-semibold hover:bg-[var(--surface-hover)] hover:border-[var(--primary)]/30 transition-all duration-200"
                        >
                            <LogIn className="h-5 w-5 text-[var(--text-secondary)]" />
                            <span>Join</span>
                        </button>
                    </div>

                    {/* Section Tabs */}
                    <div className="flex p-1 rounded-xl bg-[var(--surface-light)] border border-[var(--border-light)] mb-6">
                        <button
                            onClick={() => setActiveSection("joined")}
                            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === "joined"
                                ? "bg-[var(--bg-primary)] text-[var(--primary)] shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                                }`}
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span>Joined</span>
                        </button>
                        <button
                            onClick={() => setActiveSection("created")}
                            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === "created"
                                ? "bg-[var(--bg-primary)] text-[var(--primary)] shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                                }`}
                        >
                            <Users className="h-4 w-4" />
                            <span>Created</span>
                        </button>
                    </div>

                    {/* Header for List */}
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                            {activeSection === "joined" ? "Recent Conversations" : "Your Rooms"}
                        </h3>
                        <span className="text-xs text-[var(--text-tertiary)] bg-[var(--surface-light)] px-2 py-0.5 rounded-full border border-[var(--border-light)]">
                            {rooms.length}
                        </span>
                    </div>

                    {/* Room List - Scrollable Area */}
                    <div className="flex-1 overflow-y-auto min-h-0 space-y-1 -mx-2 px-2 scrollbar-thin scrollbar-thumb-[var(--border-light)] scrollbar-track-transparent">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-40 space-y-3 opacity-50">
                                <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs text-[var(--text-secondary)]">Loading rooms...</span>
                            </div>
                        ) : rooms.length > 0 ? (
                            rooms.map((room) => (
                                <div key={room.id} onClick={() => navigate(`/chat/${room.id}`, { state: { room } })}>
                                    <RoomCard
                                        room={room}
                                        isActive={activeRoomId && parseInt(activeRoomId) === parseInt(room.id)}
                                        onClick={() => { }} // Handled by parent div to avoid double clicks or layout issues
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-center p-4 border-2 border-dashed border-[var(--border-light)] rounded-2xl mt-2 bg-[var(--surface-light)]/30">
                                <div className="w-12 h-12 bg-[var(--surface-light)] rounded-full flex items-center justify-center mb-3">
                                    {activeSection === "joined" ?
                                        <MessageSquare className="h-6 w-6 text-[var(--text-tertiary)]" /> :
                                        <Users className="h-6 w-6 text-[var(--text-tertiary)]" />
                                    }
                                </div>
                                <p className="text-sm font-medium text-[var(--text-secondary)]">No rooms found</p>
                                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                                    {activeSection === "joined" ? "Join a room to get started" : "Create your first room"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Profile/User Section could go here if needed in future */}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
