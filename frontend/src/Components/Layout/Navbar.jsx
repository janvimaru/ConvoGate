import React, { useState, useEffect } from 'react';
import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NotificationBadge } from '../UI/NotificationBadge';
import ProfileDropdown from '../Profile/ProfileDropdown';
import NotificationPanel from '../Profile/NotificationPanel';
import Toast from '../UI/Toast';
import { useAuth } from '../../Context/AuthContext';
import { useTheme } from '../../Context/ThemeContext';
import { adminJoinActionAPI } from '../../Utils/api';
import { API_BASE, WS_BASE, LOGO_BASE64 } from '../../Utils/constants';
import { getShadeGradient } from '../../Utils/colorUtils';

const Navbar = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null); // Current toast notification
    const [isConnected, setIsConnected] = useState(false);
    const [loadingIds, setLoadingIds] = useState([]);

    const { theme, toggleTheme } = useTheme();
    const { user, token } = useAuth();
    const location = useLocation();
    const pathnameRef = React.useRef(location.pathname);

    // Update ref when pathname changes without triggering other effects
    useEffect(() => {
        pathnameRef.current = location.pathname;
    }, [location.pathname]);

    // Fetch user data from your API
    useEffect(() => {
        const fetchUserData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Try to fetch user data from your API
                const response = await fetch(`${API_BASE}/api/user/profile/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                } else {
                    // If API fails, try to get from localStorage or use auth context
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        setUserData(JSON.parse(savedUser));
                    } else if (user) {
                        setUserData(user);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // Fallback to localStorage or auth context
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    setUserData(JSON.parse(savedUser));
                } else if (user) {
                    setUserData(user);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token, user]);

    // Fetch notifications from API
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!token) return;

            try {
                const response = await fetch(`${API_BASE}/notifications/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    // Normalize notification IDs to 'id'
                    const items = data.notifications || data || [];
                    setNotifications(items.map(n => ({
                        ...n,
                        id: n.id || n.notification_id
                    })));
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        if (token) {
            fetchNotifications();
        }
    }, [token]);

    // Real-time Notifications Socket
    useEffect(() => {
        if (!token || !userData?.user_id) return;

        let socket;
        let reconnectTimer;
        let retryCount = 0;
        const maxRetries = 10;

        const connect = () => {
            const socketUrl = `${WS_BASE}/ws/notifications/?user_id=${userData.user_id}`;

            console.log("Connecting to Notification Socket:", socketUrl);
            socket = new WebSocket(socketUrl);

            socket.onopen = () => {
                console.log("Notification Socket Connected");
                setIsConnected(true);
                retryCount = 0; // Reset retries on success
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Determine message text
                    let messageText = data.message || "New notification";
                    let title = "Notification";

                    // console.log("WS Notification Data:", data);

                    // Dispatch global event for other components (e.g., Sidebar) to react
                    window.dispatchEvent(new CustomEvent('notification-received', { detail: data }));

                    if ((data.type === 'message' || data.type === 'new_message') && data.sender_name) {
                        title = data.sender_name;
                        messageText = `New message from ${data.sender_name} in ${data.room_name || 'a room'}`;
                    } else if (data.type === 'join_request') {
                        title = "Join Request";
                        messageText = `${data.sender_name || 'Someone'} wants to join ${data.room_name || 'your room'}`;
                    } else if (data.type === 'join_approved') {
                        title = "Access Granted";
                        messageText = `Your join request for ${data.room_name || 'a room'} was approved`;
                    } else if (data.type === 'join_rejected') {
                        title = "Access Denied";
                        messageText = `Your join request for ${data.room_name || 'a room'} was rejected`;
                    }

                    // Create new notification object
                    const newNotification = {
                        id: data.notification_id || Date.now(),
                        type: data.type || 'system',
                        message: messageText,
                        time: 'Just now',
                        read: false,
                        room_id: data.room_id,
                        reference_id: data.reference_id,
                        created_at: 'Just now'
                    };

                    setNotifications(prev => {
                        const isMessage = data.type === 'message' || data.type === 'new_message';
                        // Deduplicate: If it's a message, remove previous ones from the same room
                        const filtered = prev.filter(n => {
                            if (isMessage && (n.type === 'message' || n.type === 'new_message')) {
                                return n.room_id !== data.room_id;
                            }
                            // For system notifications, keep unique types per room
                            return !(n.type === data.type && n.room_id === data.room_id);
                        });
                        return [newNotification, ...filtered].slice(0, 10);
                    });

                    // Show Toast?
                    // Don't show toast for messages if we are in that room
                    const pathParts = (pathnameRef.current || "").split('/');
                    const currentRoomIdInPath = pathParts[1] === 'chat' ? pathParts[2] : null;
                    const isCurrentRoom = currentRoomIdInPath && parseInt(currentRoomIdInPath) === parseInt(data.room_id);

                    if ((data.type === 'message' || data.type === 'new_message') && isCurrentRoom) {
                        return;
                    }

                    setToast({
                        id: Date.now(),
                        type: data.type === 'error' ? 'error' : (data.type === 'new_message' || data.type === 'message' ? 'message' : 'info'),
                        title: title,
                        message: messageText
                    });

                } catch (err) {
                    console.error("Error parsing notification:", err);
                }
            };

            socket.onclose = () => {
                console.log("Notification Socket Disconnected");
                setIsConnected(false);

                // Exponential Backoff
                const timeout = Math.min(1000 * (2 ** retryCount), 10000); // Max 10s wait
                retryCount++;

                console.log(`Reconnecting in ${timeout}ms (Attempt ${retryCount})`);
                reconnectTimer = setTimeout(connect, timeout);
            };

            socket.onerror = (error) => {
                console.error("Notification Socket Error:", error);
                socket.close();
            };
        };

        connect();

        return () => {
            if (socket) socket.close();
            clearTimeout(reconnectTimer);
        };
    }, [token, userData?.user_id]);

    // ✅ AUTO-CLEAR messages for current room
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        if (pathParts[1] === 'chat' && pathParts[2]) {
            const currentRoomId = parseInt(pathParts[2]);
            if (currentRoomId) {
                // 1. Clear local state
                setNotifications(prev => prev.filter(n => {
                    const isMsg = n.type === 'message' || n.type === 'new_message';
                    return !(isMsg && parseInt(n.room_id) === currentRoomId);
                }));

                // 2. Clear backend
                if (token) {
                    fetch(`${API_BASE}/notifications/mark_room_read/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ room_id: currentRoomId })
                    }).catch(err => console.error("Mark room read failed:", err));
                }
            }
        }
    }, [location.pathname, token]);

    const handleToggleNotifications = async () => {
        const nextState = !showNotifications;
        setShowNotifications(nextState);

        if (nextState && notifications.some(n => !n.read && n.is_read !== 1)) {
            // Optimistically mark all as read in UI
            setNotifications(prev => prev.map(n => ({ ...n, read: true, is_read: 1 })));

            // API call to mark all as read in DB
            if (token) {
                try {
                    await fetch(`${API_BASE}/notifications/mark_all_read/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                } catch (err) {
                    console.error("Mark all read failed:", err);
                }
            }
        }
    };

    const handleManualReconnect = () => {
        window.location.reload();
    };

    const handleNotificationAction = async (notification, action) => {
        if (action === 'click') {
            if (notification.room_id) {
                navigate(`/chat/${notification.room_id}`);
                setShowNotifications(false);
                // Remove messages from list after clicking/viewing
                if (notification.type === 'message' || notification.type === 'new_message') {
                    setNotifications(prev => prev.filter(n => n.id !== notification.id));
                }
            }
            return;
        }

        // Check if notification has valid room_id
        if (!notification.room_id || !notification.reference_id) {
            console.error("Broken notification object:", notification);
            alert("This request is invalid or incomplete.");
            return;
        }

        const notifId = notification.id || notification.notification_id;
        setLoadingIds(prev => [...prev, notifId]);

        try {
            await adminJoinActionAPI(
                notification.room_id,
                notification.reference_id, // user who requested
                action // "approve" or "reject"
            );

            // Remove notification from list instantly (optimistic UI)
            setNotifications(prev => prev.filter(n => (n.id || n.notification_id) !== notifId));

            // Extract names for better message
            const person = notification.username || notification.sender_name || "the user";
            const room = notification.room_name || "the chatroom";

            setToast({
                id: Date.now(),
                type: 'success',
                title: action === 'approve' ? 'Approved' : 'Rejected',
                message: `You ${action}d ${person} for ${room}.`
            });

        } catch (err) {
            console.error(`${action} failed`, err.response?.data || err);
            setToast({
                id: Date.now(),
                type: 'error',
                title: 'Error',
                message: `Failed to ${action} request.`
            });
        } finally {
            setLoadingIds(prev => prev.filter(id => id !== notifId));
        }
    };

    // Get user initials for PROFILE avatar (AJ for Alice Jax)
    const getUserInitialsForProfile = () => {
        const currentUser = userData || user;
        if (!currentUser) return 'U';

        // Use first_name + last_name initials if available
        if (currentUser.first_name && currentUser.last_name) {
            return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
        }

        // Try to get from full_name if available
        if (currentUser.full_name) {
            const names = currentUser.full_name.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[1][0]}`.toUpperCase();
            }
            return names[0][0].toUpperCase();
        }

        // Fallback to username initials
        return currentUser?.username?.slice(0, 2).toUpperCase() || 'U';
    };

    // Get username to display
    const getUsername = () => {
        const currentUser = userData || user;
        return currentUser?.username || 'User';
    };

    // Get unread notification count
    const getUnreadCount = () => {
        return notifications.filter(n => n.read === false || n.is_read === 0).length;
    };

    if (loading) {
        return (
            <header className="w-full flex flex-col z-50 shrink-0">
                <nav className="w-full bg-[var(--navbar-bg)] border-b border-[var(--border-light)] transition-colors duration-300">
                    <div className="px-6 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 10px rgba(139, 92, 246, 0.35)', border: '1.5px solid rgba(139, 92, 246, 0.4)', background: '#0d0a1a' }}>
                                    <img src={LOGO_BASE64} alt="CG" className="w-full h-full" style={{ objectFit: 'cover', objectPosition: 'center 38%', transform: 'scale(1.4)' }} />
                                </div>
                                <h1 className="text-xl font-semibold bg-gradient-to-r from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] bg-clip-text text-transparent">
                                    ConvoGate
                                </h1>
                            </div>
                            <div className="animate-pulse">
                                <div className="w-32 h-10 bg-[var(--surface-hover)] rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        );
    }

    return (
        <header className="w-full flex flex-col z-50 shrink-0">
            <Toast notification={toast} onClose={() => setToast(null)} />

            {/* CONNECTION STATUS BANNER */}
            {!isConnected && token && (
                <div className="bg-orange-500 text-white text-xs font-medium py-1.5 text-center shadow-md animate-in slide-in-from-top duration-300 flex items-center justify-center">
                    <span className="animate-pulse">Connecting...</span>
                    <button onClick={handleManualReconnect} className="ml-3 underline hover:text-orange-100">Tap to retry</button>
                </div>
            )}

            <nav className="w-full bg-[var(--navbar-bg)] border-b border-[var(--border-light)] transition-all duration-300">
                {/* ... navbar content ... */}
                <div className="px-6 py-3">
                    <div className="flex items-center justify-between">
                        {/* Branding - Clickable to Dashboard */}
                        <div
                            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate('/dashboard')}
                        >
                            {/* Mobile Menu Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent navigation when opening menu
                                    onMenuClick();
                                }}
                                className="mr-4 md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <Menu className="h-6 w-6" />
                            </button>

                            <div className="flex items-center space-x-3">
                                {/* Logo - ALWAYS shows "CG" */}
                                 <div className="w-10 h-10 rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 10px rgba(139, 92, 246, 0.35)', border: '1.5px solid rgba(139, 92, 246, 0.4)', background: '#0d0a1a' }}>
                                     <img src={LOGO_BASE64} alt="CG" className="w-full h-full" style={{ objectFit: 'cover', objectPosition: 'center 38%', transform: 'scale(1.4)' }} />
                                 </div>
                                <h1 className="text-xl font-semibold bg-gradient-to-r from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] bg-clip-text text-transparent">
                                    ConvoGate
                                </h1>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl mx-8">
                            <div className="relative flex items-center">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-[var(--text-tertiary)]" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && searchQuery.trim()) {
                                            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                                        }
                                    }}
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-14 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200"
                                />
                                <button
                                    onClick={() => {
                                        if (searchQuery.trim()) {
                                            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                                        }
                                    }}
                                    className="absolute right-2 p-2 text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md hover:scale-[1.05] active:scale-95"
                                    style={{ background: 'var(--gradient-primary)' }}
                                    title="Search"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] transition-colors duration-200 group"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? (
                                    <Moon className="h-5 w-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                                ) : (
                                    <Sun className="h-5 w-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                                )}
                            </button>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={handleToggleNotifications}
                                    className="p-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] transition-colors duration-200 relative group"
                                    aria-label="Notifications"
                                >
                                    <Bell className="h-5 w-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                                    {getUnreadCount() > 0 && (
                                        <NotificationBadge count={getUnreadCount()} className="absolute -top-1 -right-1" />
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 top-12 w-96">
                                        <NotificationPanel
                                            notifications={notifications}
                                            onClose={() => setShowNotifications(false)}
                                            onAction={handleNotificationAction}
                                            loadingIds={loadingIds}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Profile Dropdown */}
                            <ProfileDropdown
                                getUserInitials={getUserInitialsForProfile}
                                username={getUsername()}
                                userData={userData}
                            />
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;