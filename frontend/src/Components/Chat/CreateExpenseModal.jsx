import React, { useState } from "react";
import Modal from "../UI/Modal"; // Assuming common Modal component
import { IndianRupee, FileText } from "lucide-react";
import { createExpenseAPI } from "../../Utils/api";

const CreateExpenseModal = ({ isOpen, onClose, roomId, members = [] }) => {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [paidBy, setPaidBy] = useState("YOU");
    const [splitMode, setSplitMode] = useState("ALL"); // ALL | SELECT
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [paymentMode, setPaymentMode] = useState("CASH");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Append payment mode to description for visibility since backend might not support it yet
            const fullDescription = `${description} (Paid via ${paymentMode})`;

            const payload = {
                room_id: roomId,
                amount: parseFloat(amount),
                description: fullDescription,
                split_with: splitMode === 'ALL' ? 'ALL' : selectedMembers
            };

            const res = await createExpenseAPI(payload);
            if (res.data.success) {
                onClose();
                setAmount("");
                setDescription("");
                setPaymentMode("CASH");
            } else {
                setError(res.data.message || "Failed to create expense");
            }
        } catch (err) {
            setError("Network Error");
        } finally {
            setLoading(false);
        }
    };

    const footerContent = (
        <div className="flex gap-3 w-full">
            <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm uppercase tracking-wider"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !amount}
                className="flex-[2] px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
            >
                {loading ? <span className="animate-pulse">Creating...</span> : "Create Expense"}
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Expense" footer={footerContent} size="md">
            <div className="px-1">
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-500 text-xs font-bold border border-red-100 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Amount Input - Prominent */}
                    <div className="relative group">
                        <label className="block text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1.5 ml-1 group-focus-within:text-emerald-600 transition-colors">
                            Total Amount
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <IndianRupee className="w-6 h-6 text-emerald-500 group-focus-within:scale-110 transition-transform duration-200" />
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-emerald-500/50 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-300 transition-all outline-none font-bold text-3xl shadow-sm focus:shadow-emerald-500/10"
                                min="0"
                                step="0.01"
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                            Description
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FileText className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this for?"
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 text-slate-700 dark:text-slate-200 font-medium transition-all shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Split Details Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Paid By */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-colors cursor-pointer group">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 group-hover:text-emerald-500 transition-colors">Paid By</span>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 font-bold text-xs ring-2 ring-white dark:ring-slate-800">
                                    You
                                </div>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">You</span>
                            </div>
                        </div>

                        {/* Split With Selection */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setSplitMode(splitMode === 'ALL' ? 'SELECT' : 'ALL')}
                                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-colors cursor-pointer group flex flex-col h-full"
                            >
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 group-hover:text-emerald-500 transition-colors">Split With</span>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {splitMode === 'ALL' ? (
                                            <>
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] text-slate-500">?</div>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-xs">
                                                {selectedMembers.length}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${splitMode === 'ALL' ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'}`}>
                                        {splitMode === 'ALL' ? 'All' : 'Select'}
                                    </span>
                                </div>
                            </button>

                            {/* Selection Dropdown */}
                            {splitMode === 'SELECT' && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--message-received-bg)] rounded-xl shadow-xl border border-[var(--border-light)] p-2 z-10 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                    {members.filter(m => m.user_id !== parseInt(localStorage.getItem('user_id'))).map(member => (
                                        <label key={member.user_id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedMembers.includes(member.user_id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedMembers([...selectedMembers, member.user_id]);
                                                    } else {
                                                        setSelectedMembers(selectedMembers.filter(id => id !== member.user_id));
                                                    }
                                                }}
                                                className="rounded text-emerald-500 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{member.username}</span>
                                        </label>
                                    ))}
                                    {members.length <= 1 && <p className="text-xs text-center text-slate-400 py-2">No other members</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Mode Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                            Paid Via
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Cash', 'UPI', 'Card'].map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setPaymentMode(mode)}
                                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${paymentMode === mode
                                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20 scale-[1.02]'
                                        : 'bg-[var(--message-received-bg)] border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default CreateExpenseModal;
