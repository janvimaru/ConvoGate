import React, { useState, useEffect } from "react";
import { getExpenseDetailsAPI, expenseActionAPI } from "../../Utils/api";
import { CreditCard, CheckCircle, XCircle, Clock, Banknote, User, IndianRupee, Activity, Building, Smartphone, AlertCircle, X, ChevronRight, Loader2 } from "lucide-react";

// --- Sub-Component: Confirmation Overlay ---
const PaymentConfirmationOverlay = ({ method, onConfirm, onCancel, amount }) => (
    <div className="absolute inset-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
        <div className="bg-[var(--surface-hover)] p-3 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
        </div>
        <h4 className="text-[var(--text-primary)] text-lg font-bold mb-2">Confirm Payment?</h4>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
            Are you sure you want to mark <span className="text-[var(--text-primary)] font-bold">₹{amount}</span> as paid via <span className="text-[var(--text-primary)] font-bold">{method}</span>?
        </p>
        <div className="flex gap-3 w-full">
            <button
                onClick={onCancel}
                className="flex-1 py-2 rounded-xl bg-[var(--surface-hover)] text-[var(--text-primary)] text-sm font-bold hover:bg-[var(--surface-active)] transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={onConfirm}
                className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
            >
                Confirm
            </button>
        </div>
    </div>
);

// --- Sub-Component: Activity Log Modal ---
const ActivityLogModal = ({ isOpen, onClose, payments, expenseTitle, createdBy }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--message-received-bg)] w-full max-m-md rounded-2xl shadow-2xl overflow-hidden border border-[var(--border-light)]">
                <div className="p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--surface-header)] backdrop-blur-md">
                    <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-500" />
                        Activity Log
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-[var(--surface-hover)] transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
                    {payments && payments.length > 0 ? (
                        payments.map((p) => (
                            <div key={p.payment_id} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-hover)]/30 border border-[var(--border-light)]">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-500">
                                    {p.user_name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[var(--text-primary)]">
                                        {p.user_name}
                                    </p>
                                    <div className="text-xs text-[var(--text-secondary)] mt-0.5 flex flex-wrap gap-1 items-center">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${p.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600' :
                                            p.status === 'SUBMITTED' ? 'bg-blue-500/10 text-blue-600' :
                                                p.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' :
                                                    'bg-amber-500/10 text-amber-600'
                                            }`}>
                                            {p.status}
                                        </span>
                                        {p.method && <span className="text-[10px] text-[var(--text-tertiary)]">• via {p.method}</span>}
                                        {p.user_id === createdBy && <span className="text-[10px] font-bold text-indigo-500 ml-1">(Creator)</span>}
                                    </div>
                                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                                        {p.confirmed_at
                                            ? `Settled at ${new Date(p.confirmed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                            : p.submitted_at
                                                ? `Submitted at ${new Date(p.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                : p.status === 'PAID' ? "Settled" : "Pending payment"
                                        }
                                    </p>
                                </div>
                                <span className="font-bold text-[var(--text-primary)] text-sm">₹{p.amount}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-[var(--text-muted)] text-sm">No activity yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ExpenseCard = ({ expenseId, isOwnMessage }) => {
    const [expense, setExpense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI States
    const [confirmMethod, setConfirmMethod] = useState(null); // null, 'CASH', 'UPI', 'BANK'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showActivity, setShowActivity] = useState(false);

    const fetchDetails = async () => {
        try {
            const res = await getExpenseDetailsAPI(expenseId);
            if (res.data.success) {
                setExpense(res.data.expense);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError("Failed to load expense");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (expenseId) fetchDetails();
        const handleUpdate = (e) => {
            if (e.detail && e.detail.expense_id === expenseId) {
                fetchDetails();
            }
        };
        window.addEventListener("expense_update_event", handleUpdate);
        return () => window.removeEventListener("expense_update_event", handleUpdate);
    }, [expenseId]);

    const initiatePayment = (method) => {
        setConfirmMethod(method);
    };

    const confirmPayment = async () => {
        if (!expense?.my_payment?.payment_id || !confirmMethod) return;

        setIsSubmitting(true);
        try {
            await expenseActionAPI({
                action: "pay",
                payment_id: expense.my_payment.payment_id,
                method: confirmMethod
            });
            setConfirmMethod(null);
            await fetchDetails();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="w-full max-w-[340px] bg-[var(--message-received-bg)] rounded-2xl p-4 shadow-sm border border-[var(--border-light)] animate-pulse">
            <div className="h-24 bg-[var(--surface-hover)] rounded-xl w-full mb-4"></div>
            <div className="h-10 bg-[var(--surface-hover)] rounded-lg w-full mb-2"></div>
            <div className="h-10 bg-[var(--surface-hover)] rounded-lg w-full"></div>
        </div>
    );
    if (error) return <div className="p-3 bg-red-50 text-red-500 rounded-lg text-xs border border-red-100">{error}</div>;
    if (!expense) return null;

    const myStatus = expense.my_payment?.status;
    const isPayer = !!expense.my_payment;
    const perPersonAmount = expense.total_users > 0 ? (expense.total_amount / expense.total_users).toFixed(2) : 0;

    // Status Badge Logic
    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING': return { color: 'bg-yellow-500', text: 'Pending', light: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' };
            case 'SUBMITTED': return { color: 'bg-blue-500', text: 'Submitted', light: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
            case 'PAID': return { color: 'bg-emerald-500', text: 'Paid', light: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
            case 'REJECTED': return { color: 'bg-red-500', text: 'Rejected', light: 'bg-red-500/10 text-red-600 border-red-500/20' };
            default: return { color: 'bg-slate-500', text: 'Unknown', light: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
        }
    };

    const statusInfo = getStatusInfo(myStatus);

    return (
        <>
            <div className="w-full max-w-[340px] bg-[var(--message-received-bg)] rounded-[18px] overflow-hidden shadow-sm border border-[var(--border-light)] transition-all duration-300 relative my-2">

                {/* Confirmation Overlay */}
                {confirmMethod && (
                    <PaymentConfirmationOverlay
                        method={confirmMethod}
                        amount={expense.my_payment?.amount}
                        onConfirm={confirmPayment}
                        onCancel={() => setConfirmMethod(null)}
                    />
                )}

                {/* Is Submitting Overlay */}
                {isSubmitting && (
                    <div className="absolute inset-0 z-50 bg-[var(--message-received-bg)]/80 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                )}

                {/* 1. Header Section */}
                <div className="bg-[var(--surface-header)] backdrop-blur-md p-5 border-b border-[var(--border-light)]">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)]">Expense</span>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                                {expense.description.replace(/\(Paid via .*\)/, "").trim()}
                            </h3>
                            {/* Parsed Payment Mode Badge */}
                            {expense.description.match(/\(Paid via (.*)\)/) && (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--surface-hover)] text-[var(--text-secondary)] uppercase tracking-wide border border-[var(--border-light)]">
                                    via {expense.description.match(/\(Paid via (.*)\)/)[1]}
                                </span>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-0.5 text-2xl font-black text-[var(--text-primary)] tracking-tight">
                                <IndianRupee className="w-5 h-5 mt-1" />
                                {expense.total_amount}
                            </div>
                            <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wide">Total Bill</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-[var(--message-received-bg)]">
                                {expense.creator_name?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Paid By</span>
                                <span className="text-xs font-bold text-[var(--text-primary)]">{expense.creator_name}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <div className="flex flex-col text-right">
                                <span className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Split Equally</span>
                                <span className="text-xs font-bold text-[var(--text-primary)]">₹{perPersonAmount} / person</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-muted)] border border-[var(--border-light)]">
                                <User className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. User Payment Section */}
                <div className="p-4">
                    {/* CREATOR VIEW */}
                    {isOwnMessage ? (
                        <div className="space-y-4">
                            {/* Stats Row */}
                            <div className="flex rounded-xl bg-[var(--surface-hover)]/50 p-1">
                                <div className="flex-1 text-center py-2 border-r border-[var(--border-light)]">
                                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">Paid</span>
                                    <span className="text-lg font-black text-[var(--text-primary)]">{expense.paid_count}</span>
                                </div>
                                <div className="flex-1 text-center py-2">
                                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">Pending</span>
                                    <span className="text-lg font-black text-amber-500">{expense.total_users - expense.paid_count}</span>
                                </div>
                            </div>

                            {/* Debtors List */}
                            <div className="space-y-3">
                                {expense.all_payments.filter(p => p.user_id !== expense.created_by).map(payment => (
                                    <div key={payment.payment_id} className="p-3 bg-[var(--surface-hover)]/30 rounded-xl border border-[var(--border-light)] relative group transition-all hover:bg-[var(--surface-hover)]">

                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${payment.status === 'PAID' ? 'bg-emerald-500' :
                                                    payment.status === 'SUBMITTED' ? 'bg-blue-500 animate-pulse' :
                                                        'bg-amber-500'
                                                    }`} />
                                                <span className="text-sm font-bold text-[var(--text-primary)]">{payment.user_name}</span>
                                            </div>
                                            <span className="font-bold text-[var(--text-primary)] text-sm">₹{payment.amount}</span>
                                        </div>

                                        {/* Actions per user */}
                                        {payment.status === 'PENDING' && (
                                            <button
                                                onClick={() => alert(`Reminder sent to ${payment.user_name}`)} // Placeholder for Reminder API
                                                className="w-full py-2 rounded-lg border border-indigo-500/20 text-indigo-500 text-xs font-bold uppercase tracking-wide hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <AlertCircle className="w-3 h-3" /> Remind User
                                            </button>
                                        )}

                                        {payment.status === 'SUBMITTED' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={async () => {
                                                        setIsSubmitting(true);
                                                        try {
                                                            await expenseActionAPI({ action: 'confirm', payment_id: payment.payment_id });
                                                        } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
                                                    }}
                                                    className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        setIsSubmitting(true);
                                                        try {
                                                            await expenseActionAPI({ action: 'reject', payment_id: payment.payment_id });
                                                        } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
                                                    }}
                                                    className="flex-1 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 text-xs font-bold flex items-center justify-center gap-1"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {payment.status === 'PAID' && (
                                            <div className="flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                                                <CheckCircle className="w-3 h-3" /> Paid
                                            </div>
                                        )}
                                        {payment.status === 'REJECTED' && (
                                            <div className="flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                                <XCircle className="w-3 h-3" /> Rejected
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Creator Footer Actions */}
                            <div className="mt-2 pt-2">
                                <button
                                    onClick={() => setShowActivity(true)}
                                    className="w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                                >
                                    <Activity className="w-3.5 h-3.5" /> View Details
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* DEBTOR VIEW: Payment Actions */
                        <>
                            {/* User Status Block */}
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--border-light)]">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-[var(--text-tertiary)]">You Pay</span>
                                    <div className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-0.5">
                                        <IndianRupee className="w-4 h-4" /> {expense.my_payment ? expense.my_payment.amount : "0"}
                                    </div>
                                </div>
                                <div className={`px-3 py-1.5 rounded-lg border border-[var(--border-light)] text-xs font-bold ${statusInfo.light} flex items-center gap-1.5`}>
                                    <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
                                    {myStatus === 'PENDING' ? 'You need to pay' :
                                        myStatus === 'SUBMITTED' ? 'Waiting Confirmation' :
                                            myStatus === 'PAID' ? 'Completed' : 'Rejected'}
                                </div>
                            </div>

                            {/* Payment Buttons (Only if Pending/Rejected) */}
                            {(myStatus === 'PENDING' || myStatus === 'REJECTED') && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase text-[var(--text-tertiary)] tracking-wider">Select Payment Method</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => initiatePayment('CASH')} className="group flex flex-col items-center justify-center p-3 rounded-xl border border-[var(--border-light)] hover:bg-[var(--surface-hover)] transition-all active:scale-95">
                                            <Banknote className="w-6 h-6 mb-1 text-emerald-500 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-bold text-[var(--text-secondary)]">Cash</span>
                                        </button>
                                        <button onClick={() => initiatePayment('UPI')} className="group flex flex-col items-center justify-center p-3 rounded-xl border border-[var(--border-light)] hover:bg-[var(--surface-hover)] transition-all active:scale-95">
                                            <Smartphone className="w-6 h-6 mb-1 text-orange-500 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-bold text-[var(--text-secondary)]">UPI</span>
                                        </button>
                                        <button onClick={() => initiatePayment('BANK')} className="group flex flex-col items-center justify-center p-3 rounded-xl border border-[var(--border-light)] hover:bg-[var(--surface-hover)] transition-all active:scale-95">
                                            <Building className="w-6 h-6 mb-1 text-blue-500 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-bold text-[var(--text-secondary)]">Bank</span>
                                        </button>
                                    </div>
                                    {myStatus === 'REJECTED' && (
                                        <div className="text-center text-xs text-red-500 font-medium animate-pulse">
                                            Previous payment rejected. Please try again.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Waiting/Completed States */}
                            {myStatus === 'SUBMITTED' && (
                                <div className="py-6 flex flex-col items-center justify-center text-center">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full animate-bounce mb-3">
                                        <Clock className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">Payment Submitted</p>
                                    <p className="text-xs text-[var(--text-tertiary)]">Waiting for creator to confirm.</p>
                                </div>
                            )}
                            {myStatus === 'PAID' && (
                                <div className="py-6 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-3">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">Payment Completed</p>
                                </div>
                            )}

                            <button
                                onClick={() => setShowActivity(true)}
                                className="w-full mt-4 py-3 rounded-xl bg-[var(--surface-hover)]/50 text-[var(--text-secondary)] text-xs font-bold hover:bg-[var(--surface-active)] transition-colors"
                            >
                                View Details
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Activity Modal Portal/Overlay */}
            <ActivityLogModal
                isOpen={showActivity}
                onClose={() => setShowActivity(false)}
                payments={expense.all_payments}
                expenseTitle={expense.description}
                createdBy={expense.created_by}
            />
        </>
    );
};

export default ExpenseCard;
