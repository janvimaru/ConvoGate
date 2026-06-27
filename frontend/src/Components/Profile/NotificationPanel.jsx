


import React, { useState } from "react";
import { Bell, Check, X, Users, MessageSquare } from "lucide-react";

const NotificationPanel = ({ notifications, onClose, onAction, loadingIds = [] }) => {
    const iconFor = (type) => {
        if (type === "join_request") return <Users size={16} className="text-blue-500" />;
        if (type === "message" || type === "new_message") return <MessageSquare size={16} className="text-green-500" />;
        return <Bell size={16} />;
    };


    return (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--glass-dropdown-bg)] backdrop-blur-xl border border-[var(--glass-dropdown-border)] rounded-xl shadow-2xl z-[9999] text-[var(--glass-dropdown-text)]">
            {/* Header */}
            <div className="p-4 flex justify-between border-b border-[var(--glass-dropdown-border)]">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-[var(--glass-dropdown-text)]" />
                    <span className="font-semibold text-[var(--glass-dropdown-text)]">Notifications</span>
                </div>
                <button onClick={onClose} className="text-[var(--glass-dropdown-text)] opacity-60 hover:opacity-100 transition-opacity">
                    <X size={18} />
                </button>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 && (
                    <p className="p-6 text-center text-sm opacity-60 text-[var(--glass-dropdown-text)]">
                        No notifications
                    </p>
                )}

                {notifications.map((n) => (
                    <div
                        key={n.id || n.notification_id}
                        onClick={() => onAction(n, 'click')}
                        className="p-4 flex gap-3 border-b border-[var(--border-light)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer group"
                    >
                        <div className="mt-1">
                            {iconFor(n.type)}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-[var(--glass-dropdown-text)] group-hover:text-[var(--primary)] transition-colors">{n.message}</p>
                            <p className="text-xs text-[var(--glass-dropdown-text)] opacity-40 mt-1">{n.created_at || n.time}</p>
                        </div>

                        {n.type === "join_request" && (
                            <div className="flex gap-1 items-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => onAction(n, "approve")}
                                    disabled={loadingIds.includes(n.id)}
                                    className="p-1.5 hover:bg-green-100 hover:text-green-600 rounded text-[var(--text-secondary)] transition-colors disabled:opacity-50"
                                    title="Approve"
                                >
                                    <Check size={16} />
                                </button>

                                <button
                                    onClick={() => onAction(n, "reject")}
                                    disabled={loadingIds.includes(n.id)}
                                    className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded text-[var(--text-secondary)] transition-colors disabled:opacity-50"
                                    title="Reject"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationPanel;
