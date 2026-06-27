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
                // Success - the parent usually refreshes group data
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
        <div className={`fixed top-0 right-0 h-full bg-[#0f172a]/95 backdrop-blur-2xl border-l border-white/10 shadow-3xl transition-all duration-500 z-[60] flex flex-col overflow-hidden ${isOpen ? 'w-80' : 'w-0'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Room Details</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-slate-500 transition-all hover:rotate-90"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Room Profile Section */}
                <div className="p-8 flex flex-col items-center text-center border-b border-slate-800/50 bg-[#0f172a]">
                    <div className="relative group/avatar mb-6">
                        <div className="w-28 h-28 rounded-[2rem] p-1 bg-slate-800/80 shadow-xl border border-slate-700/50">
                            <div className="w-full h-full rounded-[1.8rem] bg-slate-900 overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-500">
                                <ImageWithFallback
                                    src={group.avatar}
                                    alt={name}
                                    initials={name.charAt(0).toUpperCase()}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                                />
                            </div>
                        </div>
                        {isGroupAdmin && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 p-3 bg-slate-800 text-slate-300 rounded-2xl shadow-xl opacity-0 group-hover/avatar:opacity-100 transition-all hover:bg-slate-700 active:scale-90 border border-slate-600"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>

                    <h2 className="text-xl font-black text-white tracking-tight mb-1">{name}</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-4 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                        {group.isGroup ? 'Group Network' : 'Direct Sync'}
                    </p>

                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-[1.5rem] mb-6 shadow-sm">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-300 tracking-widest leading-none" style={{ marginTop: '1px' }}>
                            {group.created_at ? formatDate(group.created_at) : 'Feb 2026'}
                        </span>
                    </div>

                    {group.description && (
                        <p className="text-sm text-slate-400 leading-relaxed px-4 italic opacity-80 font-medium">
                            "{group.description}"
                        </p>
                    )}
                </div>

                {/* Participants Section */}
                <div className="p-4">
                    <div className="flex items-center justify-between px-2 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center border border-slate-700/50">
                                <Users className="h-4 w-4 text-slate-400" />
                            </div>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Room Members</h4>
                        </div>
                        <span className="text-[11px] bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full font-black shadow-sm">{members.length}</span>
                    </div>

                    <div className="space-y-3">
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
                <div className="p-6 bg-slate-900/80 border-t border-white/10 flex justify-center">
                    <button className="w-full flex items-center justify-center gap-2 py-4 rounded-[1.2rem] bg-white/5 hover:bg-white/10 transition-all font-black text-[11px] text-white border border-white/10 uppercase tracking-widest">
                        <Settings className="w-4 h-4 text-slate-500" /> Config
                    </button>
                </div>
            )}
        </div>
    );
};

const MemberItem = ({ member, isAdminRole, isGroupAdmin, myUserId, onRemove, getInitials }) => {
    const name = member.first_name ? `${member.first_name} ${member.last_name || ''}` : member.username;

    return (
        <div className="flex items-center gap-2 p-2 hover:bg-white/[0.04] rounded-xl transition-all group active:scale-[0.99] border border-transparent hover:border-white/5">
            <div className="relative shrink-0">
                <div className={`w-8 h-8 rounded-lg p-0.5 bg-gradient-to-tr ${isAdminRole ? 'from-amber-500/30 to-orange-500/30' : 'from-slate-700/30 to-slate-800/30'}`}>
                    <div className="w-full h-full rounded-[0.5rem] bg-slate-900 overflow-hidden flex items-center justify-center text-[10px] font-bold text-slate-500">
                        <ImageWithFallback
                            src={member.avatar}
                            alt={member.username}
                            initials={getInitials(member.first_name ? `${member.first_name} ${member.last_name || ''}` : null, member.username)}
                            className="w-full h-full object-cover transition-all duration-500"
                        />
                    </div>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#1a1f2e] shadow-sm ${member.is_online ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-bold text-slate-200 truncate group-hover:text-white transition-colors tracking-tight">{name}</p>
                    {isAdminRole && <Shield className="h-2.5 w-2.5 text-amber-500/60" />}
                </div>
                <p className="text-[8px] text-slate-600 truncate font-black uppercase tracking-wider opacity-60">
                    {member.status_message || (member.is_online ? 'Active' : 'Offline')}
                </p>
            </div>

            {isGroupAdmin && member.user_id !== myUserId && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500/40 hover:text-rose-500 transition-all"
                    title="Remove Member"
                >
                    <UserMinus className="w-3 h-3" />
                </button>
            )}
        </div>
    );
};

export default GroupInfoPanel;
