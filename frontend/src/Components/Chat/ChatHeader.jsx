import React, { useState, useEffect } from 'react';
import { Users, Lock, MoreVertical, Phone, Video, Info, Search, X, Filter, Image as ImageIcon, Film, Mic, FileText, Save, Bookmark } from 'lucide-react';

const ChatHeader = ({
    roomName, roomAvatar, memberCount, isPrivate, lastSeen, typingUser,
    statusMessage, onInfoToggle, onSearch,
    showSaveButton, isSaved, onSave
}) => {

    return (
        <div className="sticky top-0 z-40 bg-[var(--bg-primary)] border-b border-[var(--border-light)] transition-all duration-300">
            <div className="px-6 py-4 w-full">
                <div className="flex items-center justify-between">

                    {/* Room Info (Clickable for Info Toggle) */}
                    <button
                        onClick={onInfoToggle}
                        className="flex items-center space-x-4 animate-in slide-in-from-left duration-300 group/info transition-all"
                        aria-label="Toggle room info"
                    >
                        {/* Room Avatar */}
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover/info:scale-105 shadow-md shadow-[var(--primary)]/10">
                                {roomAvatar ? (
                                    <img src={roomAvatar} alt={roomName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold text-xl">
                                        {roomName?.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            {isPrivate && (
                                <div className="absolute -bottom-1 -right-1 p-1 bg-[var(--bg-secondary)] rounded-full shadow-lg border-2 border-[var(--bg-primary)]">
                                    <Lock className="h-3 w-3 text-[var(--text-muted)] group-hover/info:text-[var(--primary)] transition-colors" />
                                </div>
                            )}
                        </div>

                        {/* Room Details */}
                        <div className="text-left">
                            <div className="flex items-center space-x-2">
                                <h2 className="text-lg font-bold text-[var(--text-primary)] leading-tight group-hover/info:text-[var(--primary)] transition-colors">
                                    {roomName}
                                </h2>
                                {isPrivate && (
                                    <Lock className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover/info:text-[var(--primary)] transition-colors" />
                                )}
                            </div>
                            <div className="flex items-center space-x-4 mt-1 h-5">
                                {typingUser ? (
                                    <span className="text-sm font-medium text-[var(--primary)] animate-pulse">
                                        {typingUser} is typing...
                                    </span>
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1.5 overflow-hidden">
                                            <Users className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                            <span className="text-sm text-[var(--text-secondary)] font-medium">
                                                {memberCount} members
                                            </span>
                                        </div>
                                        {lastSeen && (
                                            <span className="text-sm text-[var(--text-muted)] border-l border-[var(--border-light)] pl-4">
                                                Active {lastSeen}
                                            </span>
                                        )}
                                        {isPrivate && statusMessage && (
                                            <span className="text-sm text-[var(--text-muted)] italic truncate max-w-[200px] border-l border-[var(--border-light)] pl-4">
                                                "{statusMessage}"
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                        {showSaveButton && (
                            <button
                                onClick={onSave}
                                className={`p-2.5 rounded-xl transition-all duration-200 ${isSaved
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    : 'bg-[var(--surface-light)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--primary)]'}`}
                                aria-label={isSaved ? "Saved" : "Save Chat"}
                                title={isSaved ? "Chat Saved" : "Save Chat"}
                            >
                                {isSaved ? <Bookmark className="h-5 w-5 fill-current" /> : <Bookmark className="h-5 w-5" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;