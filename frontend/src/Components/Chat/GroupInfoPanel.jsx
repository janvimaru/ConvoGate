import React, { useRef, useState } from "react";
import { X, Users, Shield, User, Info, Calendar, LogOut, Settings, UserRound, UserMinus, Camera, Loader2 } from "lucide-react";
import { removeMemberAPI, uploadRoomAvatarAPI } from "../../Utils/api";

const ImageWithFallback = ({ src, alt, initials, className }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError || !src) {
        return (
            <div className={`flex items-center justify-center bg-slate-800 text-slate-500 font-bold uppercase tracking-widest ${className}`}>
                {initials}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
        />
    );
};

/**
 * GroupInfoPanel Component
 * Features neutral colors, width fix, smaller icons, and initials fallback.
 */
const GroupInfoPanel = ({ isOpen, onClose, group, members }) => {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const myUser = JSON.parse(localStorage.getItem("user") || "{}");
    const myUserId = myUser.user_id || myUser.id;
    const isGroupAdmin = (group?.adminUserId === myUserId) || (group?.admin_id === myUserId);
    const name = group?.name || "Room";

    const admins = members?.filter(m => m.role === 'admin') || [];
    const regulars = members?.filter(m => m.role !== 'admin') || [];

    // Helper for initials fallback
    const getInitials = (name, username) => {
        if (name) {
            const parts = name.split(" ");
            return parts.map(p => p[0]).join("").toUpperCase().substring(0, 1); // Single initial for compact view
        }
        return username?.substring(0, 1).toUpperCase() || "?";
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Recently";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Recently";
        return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    };

    const handleAvatarClick = () => {
        if (isGroupAdmin) fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("room_id", group.id || group.room_id);
        formData.append("media", file);

        try {
            const res = await uploadRoomAvatarAPI(formData);
            if (res.data.success) {
                alert("Room avatar updated.");
            }
        } catch (err) {
            console.error("Upload failed:", err);
            alert(err.response?.data?.message || "Failed to upload avatar.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            const res = await removeMemberAPI(group.id || group.room_id, userId);
            if (res.data.success) {
                alert("Member removed successfully.");
            }
        } catch (err) {
            console.error("Removal failed:", err);
            alert(err.response?.data?.error || "Failed to remove member.");
        }
    };

    return (
        <div className={`fixed top-0 right-0 h-full bg-[var(--bg-secondary)] border-l border-[var(--border-light)] shadow-2xl transition-all duration-300 z-[60] flex flex-col overflow-hidden ${isOpen ? 'w-80' : 'w-0'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-light)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Room Details</h3>
                <button onClick={onClose} className="p-1.5 hover:bg-[var(--surface-hover)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all hover:rotate-90"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Room Profile Section */}
                <div className="p-6 flex flex-col items-center text-center border-b border-[var(--border-light)] bg-[var(--bg-primary)]/50">
                    <div className="relative group/avatar mb-4">
                        <div className="w-24 h-24 rounded-2xl p-0.5 bg-[var(--border-light)] shadow-md">
                            <div className="w-full h-full rounded-[0.9rem] bg-[var(--surface-hover)] overflow-hidden flex items-center justify-center text-2xl font-bold text-[var(--text-secondary)]">
                                <ImageWithFallback
                                    src={group.avatar}
                                    alt={name}
                                    initials={name.charAt(0).toUpperCase()}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-105"
                                />
                            </div>
                        </div>
                        {isGroupAdmin && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-1 -right-1 p-2 bg-[var(--surface-light)] text-[var(--text-secondary)] rounded-xl shadow-md opacity-0 group-hover/avatar:opacity-100 transition-all hover:bg-[var(--surface-hover)] active:scale-95 border border-[var(--border-light)]"
                            >
                                <Camera className="h-4.5 w-4.5" />
                            </button>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>

                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1.5">{name}</h2>
                    <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-4 bg-[var(--surface-active)] px-3 py-1 rounded-full">
                        {group.isGroup ? 'Group Network' : 'Direct Sync'}
                    </p>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-hover)] border border-[var(--border-light)] rounded-xl mb-4 shadow-sm">
                        <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                            {group.created_at ? formatDate(group.created_at) : 'Feb 2026'}
                        </span>
                    </div>

                    {group.description && (
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed px-2 italic font-normal">
                            "{group.description}"
                        </p>
                    )}
                </div>

                {/* Participants Section */}
                <div className="p-4">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[var(--surface-hover)] flex items-center justify-center border border-[var(--border-light)]">
                                <Users className="h-4 w-4 text-[var(--text-secondary)]" />
                            </div>
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Room Members</h4>
                        </div>
                        <span className="text-[11px] bg-[var(--surface-active)] border border-[var(--border-light)] text-[var(--text-primary)] px-2.5 py-0.5 rounded-full font-semibold shadow-sm">{members.length}</span>
                    </div>

                    <div className="space-y-2">
                        {members.map(member => (
                            <MemberItem
                                key={member.user_id}
                                member={member}
                                isAdminRole={group.isGroup && (group.admin_id === member.user_id || group.adminUserId === member.user_id)}
                                isGroupAdmin={isGroupAdmin}
                                myUserId={myUserId}
                                onRemove={() => handleRemoveMember(member.user_id)}
                                getInitials={(fn, un) => (fn ? fn.substring(0, 2) : un.substring(0, 2)).toUpperCase()}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            {isGroupAdmin && (
                <div className="p-4 bg-[var(--bg-primary)]/80 border-t border-[var(--border-light)] flex justify-center">
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--surface-light)] hover:bg-[var(--surface-hover)] transition-all font-semibold text-[11px] text-[var(--text-primary)] border border-[var(--border-light)] uppercase tracking-wider shadow-sm">
                        <Settings className="w-4 h-4 text-[var(--text-secondary)]" /> Config
                    </button>
                </div>
            )}
        </div>
    );
};

const MemberItem = ({ member, isAdminRole, isGroupAdmin, myUserId, onRemove, getInitials }) => {
    const name = member.first_name ? `${member.first_name} ${member.last_name || ''}` : member.username;

    return (
        <div className="flex items-center gap-2.5 p-2 hover:bg-[var(--surface-hover)] rounded-xl transition-all group border border-transparent hover:border-[var(--border-light)]/40">
            <div className="relative shrink-0">
                <div className={`w-8 h-8 rounded-lg p-0.5 bg-gradient-to-tr ${isAdminRole ? 'from-amber-500/30 to-orange-500/30' : 'from-[var(--border-light)] to-[var(--surface-hover)]'}`}>
                    <div className="w-full h-full rounded-[0.4rem] bg-[var(--surface-light)] overflow-hidden flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)]">
                        <ImageWithFallback
                            src={member.avatar}
                            alt={member.username}
                            initials={getInitials(member.first_name ? `${member.first_name} ${member.last_name || ''}` : null, member.username)}
                            className="w-full h-full object-cover transition-all duration-500"
                        />
                    </div>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-secondary)] shadow-sm ${member.is_online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </div>

            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-semibold text-[var(--text-primary)] truncate transition-colors tracking-tight">{name}</p>
                    {isAdminRole && <Shield className="h-2.5 w-2.5 text-amber-500/60" />}
                </div>
                <p className="text-[8px] text-[var(--text-muted)] truncate font-semibold uppercase tracking-wider">
                    {member.status_message || (member.is_online ? 'Active' : 'Offline')}
                </p>
            </div>

            {isGroupAdmin && member.user_id !== myUserId && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-red-500 transition-all"
                    title="Remove Member"
                >
                    <UserMinus className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};

export default GroupInfoPanel;
