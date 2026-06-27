import React from 'react';
import Modal from '../UI/Modal';
import { Save, Shield, Clock, AlertTriangle } from 'lucide-react';

const KeepChatModal = ({ isOpen, onClose, onConfirm, expiryHours }) => {
    const footerContent = (
        <div className="flex gap-3">
            <button
                onClick={onClose}
                className="flex-1 py-3.5 px-6 rounded-xl font-medium text-[var(--text-primary)] bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] transition-all border border-[var(--border-light)]"
            >
                Cancel
            </button>
            <button
                onClick={() => {
                    onConfirm();
                    onClose();
                }}
                className="flex-1 py-3.5 px-6 rounded-xl font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
                Keep Chat
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" footer={footerContent} size="md">
            <div className="text-center px-2">
                {/* Colorful Icon Header - Compact */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 ring-4 ring-purple-500/20">
                    <Save className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    Keep this Chat?
                </h3>

                <p className="text-[var(--text-secondary)] mb-6 text-base">
                    This chat will be <span className="font-semibold text-purple-600 dark:text-purple-400">Saved</span> and remain active until expiry.
                </p>

                {/* Info Box - Compact */}
                <div className="bg-[var(--surface-hover)] rounded-xl p-4 text-left border border-[var(--border-light)] shadow-sm text-sm">
                    <div className="flex items-start gap-3 mb-3">
                        <Clock className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                        <p className="text-[var(--text-secondary)]">
                            <strong className="text-[var(--text-primary)]">Until Expiry:</strong> Continue chatting normally.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <Shield className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-[var(--text-secondary)]">
                            <strong className="text-[var(--text-primary)]">After Expiry:</strong> Becomes <span className="font-semibold">Read-Only</span>. Not deleted.
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default KeepChatModal;
