import React, { useState, useEffect } from 'react';
import { Users, Lock, MoreVertical, Phone, Video, Info, Search, X, Filter, Image as ImageIcon, Film, Mic, FileText, Save, Bookmark } from 'lucide-react';

const ChatHeader = ({
    roomName, roomAvatar, memberCount, isPrivate, lastSeen, typingUser,
    statusMessage, onInfoToggle, onSearch,
    showSaveButton, isSaved, onSave
}) => {

    return (
        <div className="sticky top-0 z-40 bg-[var(--bg-primary)] border-b border-[var(--border-light)] transition-all duration-150">
            <div className="px-6 py-2 w-full">
                <div className="flex items-center justify-between">

                    {/* Room Info (Clickable for Info Toggle) */}
                    <button
                        onClick={onInfoToggle}
                        className="flex items-center space-x-3 group/info transition-all"
                        aria-label="Toggle room info"
                    >
                        {/* Room Avatar */}
                        <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] flex items-center justify-center overflow-hidden shadow-sm shadow-[var(--primary)]/10">
                                {roomAvatar ? (
                                    <img src={roomAvatar} alt={roomName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold text-sm">
                                        {roomName?.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            {isPrivate && (
                                <div className="absolute -bottom-1 -right-1 p-0.5 bg-[var(--bg-secondary)] rounded-full shadow border border-[var(--bg-primary)]">
                                    <Lock className="h-2.5 w-2.5 text-[var(--text-muted)] group-hover/info:text-[var(--primary)] transition-colors" />
                                </div>
                            )}
                        </div>

                        {/* Room Details */}
                        <div className="text-left">
                            <div className="flex items-center space-x-1.5">
                                <h2 className="text-sm font-bold text-[var(--text-primary)] leading-tight group-hover/info:text-[var(--primary)] transition-colors">
                                    {roomName}
                                </h2>
                                {isPrivate && (
                                    <Lock className="h-3 w-3 text-[var(--text-muted)] group-hover/info:text-[var(--primary)] transition-colors" />
                                )}
                            </div>
                            <div className="flex items-center space-x-3 mt-0.5 h-4">
                                {typingUser ? (
                                    <span className="text-xs font-medium text-[var(--primary)] animate-pulse">
                                        {typingUser} is typing...
                                    </span>
                                ) : (
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center space-x-1 overflow-hidden">
                                            <Users className="h-3 w-3 text-[var(--text-muted)]" />
                                            <span className="text-xs text-[var(--text-secondary)] font-medium">
                                                {memberCount} members
                                            </span>
                                        </div>
                                        {lastSeen && (
                                            <span className="text-xs text-[var(--text-muted)] border-l border-[var(--border-light)] pl-3">
                                                Active {lastSeen}
                                            </span>
                                        )}
                                        {isPrivate && statusMessage && (
                                            <span className="text-xs text-[var(--text-muted)] italic truncate max-w-[150px] border-l border-[var(--border-light)] pl-3">
                                                "{statusMessage}"
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1.5">
                        {showSaveButton && (
                            <button
                                onClick={onSave}
                                className={`p-1.5 rounded-lg transition-all duration-150 ${isSaved
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    : 'bg-[var(--surface-light)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--primary)]'}`}
                                aria-label={isSaved ? "Saved" : "Save Chat"}
                                title={isSaved ? "Chat Saved" : "Save Chat"}
                            >
                                {isSaved ? <Bookmark className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;