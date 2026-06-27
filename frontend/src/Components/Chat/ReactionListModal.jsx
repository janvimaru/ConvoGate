
import React, { useState } from 'react';
import { X } from 'lucide-react';

const ReactionListModal = ({ reactions, onClose }) => {
    const [activeTab, setActiveTab] = useState('All');

    if (!reactions || reactions.length === 0) return null;

    // Deduplicate reactions: Each user (by ID or name) only shows once per emoji
    const uniqueReactions = [];
    const seen = new Set();

    reactions.forEach((r, idx) => {
        // Create a unique key for user + emoji
        const userKey = (r.user_id || r.username || 'unknown').toString();
        const key = `${userKey}-${r.emoji}`;

        if (!seen.has(key)) {
            uniqueReactions.push({
                ...r,
                username: r.username || '(Unknown)', // Fallback if still missing
                user_id: r.user_id || idx
            });
            seen.add(key);
        }
    });

    // Group reactions for tabs
    const groupedReactions = uniqueReactions.reduce((acc, r) => {
        acc[r.emoji] = acc[r.emoji] || [];
        acc[r.emoji].push(r);
        return acc;
    }, {});

    const tabs = ['All', ...Object.keys(groupedReactions)];

    const filteredReactions = activeTab === 'All'
        ? uniqueReactions
        : groupedReactions[activeTab] || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-[var(--message-received-bg)] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-[var(--border-light)] animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--surface-header)] backdrop-blur-md">
                    <h3 className="font-bold text-[var(--text-primary)]">Reactions</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-[var(--surface-hover)] transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto p-2 gap-2 scrollbar-hide border-b border-[var(--border-light)]/50">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-indigo-500 text-white shadow-sm'
                                : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--surface-active)]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="max-h-[350px] overflow-y-auto p-2">
                    {filteredReactions.map((reaction, idx) => (
                        <div key={`${reaction.user_id || 'u'}-${idx}`} className="flex items-center justify-between p-2 hover:bg-[var(--surface-hover)]/50 rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center overflow-hidden border border-[var(--border-light)]">
                                    {reaction.profile_pic ? (
                                        <img
                                            src={`${window.location.protocol}//${window.location.hostname}:8000/media/${reaction.profile_pic}`}
                                            alt={reaction.username}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm font-bold text-indigo-500">
                                            {(reaction.username || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">
                                        {reaction.username || 'Unknown User'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-xl">
                                {reaction.emoji}
                            </div>
                        </div>
                    ))}
                    {filteredReactions.length === 0 && (
                        <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">No reactions found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReactionListModal;
