import React, { useEffect } from 'react';
import { X, MessageSquare, Info, AlertTriangle, CheckCircle } from 'lucide-react';

const Toast = ({ notification, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto close after 5s

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!notification) return null;

    const getIcon = () => {
        switch (notification.type) {
            case 'message': return <MessageSquare className="w-5 h-5 text-blue-500" />;
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="fixed top-20 right-6 z-[100] animate-slide-in-right">
            <div className="bg-[var(--surface-primary)] border border-[var(--border-light)] shadow-xl rounded-xl p-4 w-80 flex items-start gap-3 backdrop-blur-md">
                <div className="mt-1">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--text-primary)] text-sm">
                        {notification.title || "New Notification"}
                    </p>
                    <p className="text-[var(--text-secondary)] text-sm mt-0.5 line-clamp-2">
                        {notification.message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
                >
                    <X className="w-4 h-4 text-[var(--text-tertiary)]" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
