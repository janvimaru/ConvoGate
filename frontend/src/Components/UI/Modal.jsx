import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className={`relative w-full ${sizeClasses[size]} glass rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[75vh]`}
            >
                {/* Header */}
                <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)] bg-[var(--surface-header)] backdrop-blur-md rounded-t-2xl">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-muted)]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto min-h-0 flex-1">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex-none px-5 py-4 border-t border-[var(--border-light)] bg-[var(--surface-light)]/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;