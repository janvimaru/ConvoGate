import React from 'react';
import Modal from '../UI/Modal';
import { KeyRound, Share2, Copy, Check } from 'lucide-react';

const PinDisplayModal = ({ isOpen, onClose, pin, expiryDuration }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(pin);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="text-center p-6">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <KeyRound className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Quick Chat Created!
                </h3>
                <p className="text-[var(--text-secondary)] mb-8">
                    Share this PIN with others to let them join.
                </p>

                <div className="bg-[var(--surface-hover)] rounded-2xl p-6 border border-[var(--border-light)] mb-8 relative group">
                    <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-bold mb-3">Access PIN</p>
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-5xl font-mono font-bold text-[var(--primary)] tracking-widest">
                            {pin}
                        </span>
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-xl hover:bg-[var(--surface-active)] transition-colors text-[var(--text-secondary)]"
                            title="Copy PIN"
                        >
                            {copied ? <Check className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6" />}
                        </button>
                    </div>
                    <p className="text-xs text-orange-500 mt-4 font-medium flex items-center justify-center gap-1.5">
                        <span>Expires in {expiryDuration} hours</span>
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-4 bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-[var(--primary-shadow)]"
                >
                    Start Chatting
                </button>
            </div>
        </Modal>
    );
};

export default PinDisplayModal;
