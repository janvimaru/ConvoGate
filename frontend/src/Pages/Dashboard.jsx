import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Users, Clock, TrendingUp } from 'lucide-react';
import RoomCard from '../Components/UI/RoomCard';
import { useAuth } from '../Context/AuthContext';
import { fetchDashboardAPI } from '../Utils/api';


const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [stats, setStats] = useState(null);
    const [recentRooms, setRecentRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Dashboard Data
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const res = await fetchDashboardAPI();
                if (res.data.success) {
                    setStats(res.data.stats);
                    setRecentRooms(res.data.recent_rooms);
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    const statItems = [
        { icon: MessageSquare, label: 'Total Messages', value: stats?.total_messages || 0, change: 'Lifetime', gradient: 'from-[var(--shade-1-from)] to-[var(--shade-1-to)]' },
        { icon: Users, label: 'Active Rooms', value: stats?.active_rooms || 0, change: 'Joined', gradient: 'from-[var(--shade-2-from)] to-[var(--shade-2-to)]' },
        { icon: Clock, label: 'Created Rooms', value: stats?.created_rooms || 0, change: 'Admin', gradient: 'from-[var(--shade-3-from)] to-[var(--shade-3-to)]' },
        { icon: TrendingUp, label: 'Engagement Rate', value: stats?.engagement_rate || '0%', change: 'Active', gradient: 'from-[var(--shade-4-from)] to-[var(--shade-4-to)]' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-[var(--bg-secondary)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-5 bg-[var(--bg-primary)] transition-colors duration-300">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                    Welcome back, {user?.full_name || user?.username}!
                </h1>
                <p className="text-xs text-[var(--text-secondary)]">
                    Here's what's happening with your conversations
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statItems.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-[var(--surface-light)] rounded-xl p-4 border border-[var(--border-light)] hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-150 cursor-default"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-lg text-white shadow bg-gradient-to-br ${stat.gradient}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-medium text-[var(--text-secondary)]">
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-0.5">
                            {stat.value}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)]">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>



            {/* Recent Rooms */}
            <div className="bg-[var(--surface-light)] rounded-xl border border-[var(--border-light)] overflow-hidden">
                <div className="p-4 border-b border-[var(--border-light)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-[var(--text-primary)]">
                                Recent Conversations
                            </h2>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                Continue where you left off
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/create-room')}
                            className="px-4 py-2 rounded-lg text-xs text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition-colors duration-150"
                        >
                            New Room
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {recentRooms.length > 0 ? (
                        <div className="space-y-2">
                            {recentRooms.map((room) => (
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                    isActive={false}
                                    onClick={() => navigate(`/chat/${room.id}`)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 text-[var(--text-tertiary)]" />
                            </div>
                            <h4 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                                No conversations yet
                            </h4>
                            <p className="text-xs text-[var(--text-secondary)] mb-4">
                                Start by creating or joining a room
                            </p>
                            <button
                                onClick={() => navigate('/create-room')}
                                className="px-5 py-2.5 rounded-lg text-xs text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition-colors duration-150"
                            >
                                Create Your First Room
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Dashboard;