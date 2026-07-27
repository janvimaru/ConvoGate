import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, CheckCircle2 } from 'lucide-react';
import Modal from '../Components/UI/Modal';
import { createRoomAPI, fetchAllUsersAPI } from "../Utils/api";
import { API_BASE } from '../Utils/constants';

const CreateRoom = () => {
    const navigate = useNavigate();
    const [createdRoomId, setCreatedRoomId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [copiedPin, setCopiedPin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [roomData, setRoomData] = useState({
        name: '',
        description: '',
        isPrivate: false,
        maxMembers: 50,
        allowInvites: true,
        hasPassword: false,
        password: '',
        isQuickChat: false,
        expiryDuration: '24', // hours
    });

    // Users state
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [inviteAll, setInviteAll] = useState(true);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch users whenever searchQuery changes
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoadingUsers(true);
            try {
                const response = await fetchAllUsersAPI(searchQuery);
                setAllUsers(response.data.users || []);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [searchQuery]);

    // Filter users based on search query
    const filteredUsers = allUsers.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle room form changes
    const handleChange = (field, value) => {
        setRoomData(prev => ({ ...prev, [field]: value }));
    };

    // Handle room submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const expiryHours = roomData.isQuickChat ? parseInt(roomData.expiryDuration) : null;

        try {
            const res = await createRoomAPI({
                action: "create",
                name: roomData.name,
                description: roomData.description,
                isPrivate: roomData.isQuickChat ? 1 : (roomData.isPrivate ? 1 : 0),
                maxMembers: roomData.maxMembers,
                allowInvites: roomData.isQuickChat ? 0 : (roomData.allowInvites ? 1 : 0),
                hasPassword: roomData.isQuickChat ? 0 : (roomData.hasPassword ? 1 : 0),
                password: roomData.hasPassword ? roomData.password : null,
                invitedUsers: inviteAll ? [] : selectedUsers.map(u => u.user_id),
                inviteAll: inviteAll,
                isQuickChat: roomData.isQuickChat ? 1 : 0,
                expiryHours: expiryHours
            });

            setCreatedRoomId(res.data.room_id);

            if (res.data.pin) {
                setRoomData(prev => ({ ...prev, pin: res.data.pin }));
            }

            setShowSuccessModal(true);

        } catch (err) {
            console.error("Room creation failed:", err);
            alert(err.response?.data?.error || "Room creation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateAndJoin = () => {
        navigate(`/chat/${createdRoomId}`);
    };

    // Copy PIN helper
    const handleCopyPin = (pin) => {
        navigator.clipboard.writeText(pin);
        setCopiedPin(true);
        setTimeout(() => setCopiedPin(false), 2000);
    };

    // Toggle individual user selection
    const toggleUserSelection = (user) => {
        if (selectedUsers.some(u => u.user_id === user.user_id)) {
            setSelectedUsers(selectedUsers.filter(u => u.user_id !== user.user_id));
        } else {
            if (selectedUsers.length >= roomData.maxMembers) {
                alert(`Cannot select more than ${roomData.maxMembers} users.`);
                return;
            }
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    // Invite all toggle
    const toggleSelectAll = () => {
        setInviteAll(!inviteAll);
        if (!inviteAll) setSelectedUsers([]);
    };

    // Clear all selected users
    const clearAllSelections = () => {
        setSelectedUsers([]);
        setInviteAll(true);
    };

    // User initials for avatar
    const getUserInitials = (user) => {
        if (user.full_name) {
            return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return user.username?.slice(0, 2).toUpperCase() || 'U';
    };

    return (
        <div className="flex-1 flex flex-col p-4 md:p-6 bg-[var(--bg-primary)] overflow-hidden min-h-0 h-full transition-colors duration-300">
            <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-[var(--text-primary)]">Create a New Room</h1>
                        <p className="text-[10px] text-[var(--text-secondary)]">Set up your room preferences and invite members</p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center space-x-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                        <span>Back</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0">
                        
                        {/* Left Column: Room Live Preview (lg:col-span-4) */}
                        <div className="lg:col-span-4 bg-[var(--surface-light)] rounded-2xl p-5 border border-[var(--border-light)] shadow-sm flex flex-col items-center text-center h-full space-y-5 overflow-y-auto custom-scrollbar">
                            <div className="w-full">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4 self-start text-left">Live Preview</h3>
                                
                                <div className="flex flex-col items-center">
                                    <div className="relative group mb-3">
                                        <div className="w-24 h-24 rounded-[1.4rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden ring-4 ring-[var(--surface-light)] shadow-md">
                                            {roomData.avatar ? (
                                                <img
                                                    src={
                                                        roomData.avatar.startsWith('blob:') || roomData.avatar.startsWith('data:')
                                                            ? roomData.avatar
                                                            : `${API_BASE}/media/${roomData.avatar}`
                                                    }
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-3xl font-bold text-white">
                                                    {roomData.name ? roomData.name.charAt(0).toUpperCase() : "?"}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                                        {roomData.name || "Unnamed Room"}
                                    </h3>
                                    <p className="text-xs text-[var(--text-secondary)] mb-3 truncate max-w-full px-4">
                                        {roomData.description || "No description set"}
                                    </p>

                                    {/* Centered Side-by-Side Pill Badges */}
                                    <div className="flex items-center gap-2 mb-4 justify-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${roomData.isPrivate || roomData.isQuickChat ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            <span className={`w-1 h-1 rounded-full ${roomData.isPrivate || roomData.isQuickChat ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                            {roomData.isQuickChat ? 'Private Space' : (roomData.isPrivate ? 'Private Space' : 'Public Space')}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${roomData.isQuickChat ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                            <span className={`w-1 h-1 rounded-full ${roomData.isQuickChat ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                                            {roomData.isQuickChat ? 'Quick Chat' : 'Standard Room'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full pt-3 border-t border-[var(--border-light)] text-left space-y-2.5">
                                {/* Room Name row with icon */}
                                <div className="flex justify-between items-center text-xs py-0.5">
                                    <div className="flex items-center space-x-1.5 text-[var(--text-secondary)]">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>Room Name</span>
                                    </div>
                                    <span className="font-semibold text-[var(--text-primary)]">{roomData.name || "Not set"}</span>
                                </div>

                                {/* Visibility row with icon */}
                                <div className="flex justify-between items-center text-xs py-0.5">
                                    <div className="flex items-center space-x-1.5 text-[var(--text-secondary)]">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span>Visibility</span>
                                    </div>
                                    <span className="font-semibold text-[var(--text-primary)]">
                                        {roomData.isPrivate || roomData.isQuickChat ? 'Private' : 'Public'}
                                    </span>
                                </div>

                                {/* Capacity row with icon */}
                                <div className="flex justify-between items-center text-xs py-0.5">
                                    <div className="flex items-center space-x-1.5 text-[var(--text-secondary)]">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span>Capacity</span>
                                    </div>
                                    <span className="font-semibold text-[var(--text-primary)]">
                                        {roomData.maxMembers} Members
                                    </span>
                                </div>

                                {/* Password row with icon */}
                                <div className="flex justify-between items-center text-xs py-0.5">
                                    <div className="flex items-center space-x-1.5 text-[var(--text-secondary)]">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span>Password</span>
                                    </div>
                                    <span className="font-semibold text-[var(--text-primary)]">
                                        {roomData.isQuickChat ? 'Disabled' : (roomData.hasPassword ? 'Securely Set' : 'Not Set')}
                                    </span>
                                </div>

                                {/* Room Type row with icon */}
                                <div className="flex justify-between items-center text-xs py-0.5">
                                    <div className="flex items-center space-x-1.5 text-[var(--text-secondary)]">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span>Room Type</span>
                                    </div>
                                    <span className="font-semibold text-[var(--text-primary)]">
                                        {roomData.isQuickChat ? 'Quick Chat' : 'Standard Room'}
                                    </span>
                                </div>

                                <div className="pt-3 border-t border-[var(--border-light)]/60">
                                    {roomData.isQuickChat ? (
                                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-xl text-[10px] text-amber-600 dark:text-amber-400">
                                            This is a Quick Chat Room. Access is restricted by PIN.
                                        </div>
                                    ) : (
                                        <div className="p-2.5 bg-blue-50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl text-[10px] text-blue-600 dark:text-blue-400">
                                            {roomData.isPrivate 
                                                ? 'This is a Private Room. Only invited members can join.' 
                                                : 'This is a Standard Room. Anyone can search and join.'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Main Config Form (lg:col-span-8) */}
                        <div className="lg:col-span-8 bg-[var(--surface-light)] rounded-2xl border border-[var(--border-light)] shadow-sm p-5 md:p-6 flex flex-col justify-between h-full overflow-y-auto custom-scrollbar min-h-0">
                            <div className="space-y-6">
                                {/* Section 1: Choose Room Mode */}
                                <div>
                                    <h4 className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">
                                        1. Choose Room Mode
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Standard Room Card */}
                                        <div
                                            onClick={() => {
                                                handleChange('isQuickChat', false);
                                                handleChange('isPrivate', false);
                                            }}
                                            className={`p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-start space-x-3 ${!roomData.isQuickChat ? 'border-indigo-600 bg-indigo-50/5' : 'border-[var(--border-light)] hover:bg-[var(--surface-hover)] bg-[var(--bg-primary)]'}`}
                                        >
                                            <div className={`mt-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${!roomData.isQuickChat ? 'border-indigo-600' : 'border-[var(--text-muted)]'}`}>
                                                {!roomData.isQuickChat && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-xs text-[var(--text-primary)]">Standard Room</p>
                                                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                                                    Persistent workspace with visibility options and permanent settings.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Quick Chat Card */}
                                        <div
                                            onClick={() => {
                                                handleChange('isQuickChat', true);
                                                handleChange('isPrivate', true);
                                                setInviteAll(false);
                                            }}
                                            className={`p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-start space-x-3 ${roomData.isQuickChat ? 'border-indigo-600 bg-indigo-50/5' : 'border-[var(--border-light)] hover:bg-[var(--surface-hover)] bg-[var(--bg-primary)]'}`}
                                        >
                                            <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-xs text-[var(--text-primary)]">Quick Chat</p>
                                                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                                                    Temporary private room with auto-generated PIN and expiry.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Configuration Settings */}
                                <div className="pt-4 border-t border-[var(--border-light)]/60">
                                    <h4 className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                                        2. Configuration Settings
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                        
                                        {/* Left Column: Form Inputs */}
                                        <div className="space-y-4">
                                            {/* Room Name */}
                                            <div className="space-y-1">
                                                <label className="block text-xs font-semibold text-[var(--text-primary)]">Room Name *</label>
                                                <input
                                                    type="text"
                                                    value={roomData.name}
                                                    onChange={(e) => handleChange('name', e.target.value)}
                                                    placeholder="e.g. Design Hub"
                                                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all duration-200 text-sm"
                                                    required
                                                    minLength={3}
                                                    maxLength={50}
                                                />
                                                <div className="flex items-center justify-between text-[9px] text-[var(--text-tertiary)] font-medium px-0.5">
                                                    <span>3-50 characters</span>
                                                    <span>{roomData.name.length}/50</span>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {!roomData.isQuickChat && (
                                                <div className="space-y-1">
                                                    <label className="block text-xs font-semibold text-[var(--text-primary)]">Description (Optional)</label>
                                                    <textarea
                                                        value={roomData.description}
                                                        onChange={(e) => handleChange('description', e.target.value)}
                                                        placeholder="What's this room about?"
                                                        rows={3}
                                                        className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all duration-200 resize-none text-sm"
                                                        maxLength={200}
                                                    />
                                                    <div className="text-right text-[9px] text-[var(--text-tertiary)] font-medium px-0.5">
                                                        {roomData.description.length}/200
                                                    </div>
                                                </div>
                                            )}

                                            {/* Privacy Mode */}
                                            {!roomData.isQuickChat && (
                                                <div className="space-y-2">
                                                    <label className="block text-xs font-semibold text-[var(--text-primary)]">Privacy Mode</label>
                                                    <div className="space-y-2.5">
                                                        {/* Public Option */}
                                                        <label className="flex items-start space-x-2.5 cursor-pointer group">
                                                            <input
                                                                type="radio"
                                                                name="privacyMode"
                                                                checked={!roomData.isPrivate}
                                                                onChange={() => {
                                                                    handleChange('isPrivate', false);
                                                                    handleChange('maxMembers', 200);
                                                                    handleChange('hasPassword', false);
                                                                    setInviteAll(true);
                                                                }}
                                                                className="mt-0.5 w-3.5 h-3.5 text-indigo-600 border-[var(--border-light)] focus:ring-indigo-500 shrink-0"
                                                            />
                                                            <div>
                                                                <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-indigo-600 transition-colors">Public Room</span>
                                                                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Anyone can search and join.</p>
                                                            </div>
                                                        </label>

                                                        {/* Private Option */}
                                                        <label className="flex items-start space-x-2.5 cursor-pointer group">
                                                            <input
                                                                type="radio"
                                                                name="privacyMode"
                                                                checked={roomData.isPrivate}
                                                                onChange={() => {
                                                                    handleChange('isPrivate', true);
                                                                    handleChange('maxMembers', 50);
                                                                    setInviteAll(false);
                                                                    setSelectedUsers([]);
                                                                }}
                                                                className="mt-0.5 w-3.5 h-3.5 text-indigo-600 border-[var(--border-light)] focus:ring-indigo-500 shrink-0"
                                                            />
                                                            <div>
                                                                <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-indigo-600 transition-colors">Private Room</span>
                                                                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Invitations only.</p>
                                                            </div>
                                                        </label>

                                                        {/* Checkbox underneath (only if Private Room is selected) */}
                                                        {roomData.isPrivate && (
                                                            <label className="flex items-center space-x-2 pl-6 mt-1 cursor-pointer group animate-in slide-in-from-top-1 duration-150">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={roomData.allowInvites}
                                                                    onChange={(e) => handleChange('allowInvites', e.target.checked)}
                                                                    className="w-3.5 h-3.5 text-indigo-600 border-[var(--border-light)] rounded focus:ring-indigo-500 shrink-0"
                                                                />
                                                                <span className="text-[10px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                                                                    Allow members to invite others
                                                                </span>
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Password Protection */}
                                            {!roomData.isQuickChat && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-xs font-semibold text-[var(--text-primary)]">Password Lock</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleChange('hasPassword', !roomData.hasPassword)}
                                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${roomData.hasPassword ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                                        >
                                                            <span
                                                                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${roomData.hasPassword ? 'translate-x-4' : 'translate-x-0'}`}
                                                            />
                                                        </button>
                                                    </div>

                                                    {roomData.hasPassword && (
                                                        <div className="relative animate-in slide-in-from-top-2 duration-150">
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                value={roomData.password}
                                                                onChange={(e) => handleChange('password', e.target.value)}
                                                                placeholder="Enter password (min. 4 characters)"
                                                                className="w-full pl-3.5 pr-9 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all duration-200 text-xs"
                                                                required
                                                                minLength={4}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[10px] font-semibold"
                                                            >
                                                                {showPassword ? "Hide" : "Show"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column: Capacity, Expiry, Invites */}
                                        <div className="space-y-4">
                                            {/* Expiry Duration (Only for Quick Chat) */}
                                            {roomData.isQuickChat && (
                                                <div className="space-y-1">
                                                    <label className="block text-xs font-semibold text-[var(--text-primary)]">Expiry Duration</label>
                                                    <select
                                                        value={roomData.expiryDuration}
                                                        onChange={(e) => handleChange('expiryDuration', e.target.value)}
                                                        className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all duration-200 text-sm"
                                                    >
                                                        <option value="1">1 Hour</option>
                                                        <option value="6">6 Hours</option>
                                                        <option value="12">12 Hours</option>
                                                        <option value="24">24 Hours (1 Day)</option>
                                                        <option value="72">3 Days</option>
                                                        <option value="168">7 Days</option>
                                                    </select>
                                                </div>
                                            )}

                                            {/* Capacity Slider */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-semibold text-[var(--text-primary)]">Capacity (Members)</label>
                                                    <input
                                                        type="number"
                                                        value={roomData.maxMembers}
                                                        disabled
                                                        className="w-10 text-center py-0.5 text-xs font-bold rounded-lg border border-[var(--border-light)] bg-[var(--input-bg)] text-[var(--text-primary)] shrink-0"
                                                    />
                                                </div>
                                                <div className="bg-[var(--bg-primary)]/50 p-3 rounded-xl border border-[var(--border-light)]/40 space-y-2">
                                                    <input
                                                        type="range"
                                                        min="2"
                                                        max="200"
                                                        value={roomData.maxMembers}
                                                        onChange={(e) => {
                                                            const newMax = parseInt(e.target.value);
                                                            handleChange('maxMembers', newMax);
                                                            if (selectedUsers.length > newMax) {
                                                                setSelectedUsers(selectedUsers.slice(0, newMax));
                                                            }
                                                        }}
                                                        className="w-full h-1 bg-[var(--surface-hover)] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600"
                                                    />
                                                    <div className="flex justify-between text-[9px] text-[var(--text-tertiary)] font-medium">
                                                        <span>2</span>
                                                        <span>50</span>
                                                        <span>200</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Invite Users */}
                                            <div className="space-y-3">
                                                <label className="block text-xs font-semibold text-[var(--text-primary)]">Invite Users</label>
                                                
                                                {!roomData.isQuickChat && (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs font-semibold text-[var(--text-primary)]">Invite All Registered Users</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={toggleSelectAll}
                                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${inviteAll ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                                        >
                                                            <span
                                                                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${inviteAll ? 'translate-x-4' : 'translate-x-0'}`}
                                                            />
                                                        </button>
                                                    </div>
                                                )}

                                                {!inviteAll && (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            placeholder="Search users by name or username..."
                                                            className="w-full px-3 py-1.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all duration-200 text-xs"
                                                        />

                                                        {selectedUsers.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 p-1.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-light)]/40 max-h-24 overflow-y-auto custom-scrollbar">
                                                                {selectedUsers.map(user => (
                                                                    <span key={user.user_id} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[var(--surface-light)] border border-[var(--border-light)] text-[10px] font-semibold text-[var(--text-primary)]">
                                                                        {user.username}
                                                                        <button type="button" onClick={() => toggleUserSelection(user)} className="text-red-500 hover:text-red-700">
                                                                            <X className="w-2.5 h-2.5" />
                                                                        </button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="max-h-36 overflow-y-auto rounded-xl border border-[var(--border-light)] divide-y divide-[var(--border-light)] bg-[var(--bg-primary)]/10 custom-scrollbar">
                                                            {isLoadingUsers ? (
                                                                <div className="p-4 text-center">
                                                                    <div className="w-4 h-4 mx-auto mb-1.5 border-2 border-[var(--border-light)] border-t-[var(--primary)] rounded-full animate-spin"></div>
                                                                    <p className="text-[9px] text-[var(--text-secondary)]">Loading...</p>
                                                                </div>
                                                            ) : filteredUsers.length === 0 ? (
                                                                <div className="p-3 text-center text-[10px] text-[var(--text-muted)]">No users found</div>
                                                            ) : (
                                                                filteredUsers.map(user => (
                                                                    <div
                                                                        key={user.user_id}
                                                                        onClick={() => toggleUserSelection(user)}
                                                                        className={`p-2 hover:bg-[var(--surface-hover)] cursor-pointer transition-colors duration-150 flex items-center justify-between ${selectedUsers.some(u => u.user_id === user.user_id) ? 'bg-[var(--primary)]/5' : ''}`}
                                                                    >
                                                                        <div className="flex items-center space-x-2">
                                                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-[9px]">
                                                                                {getUserInitials(user)}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[11px] font-semibold text-[var(--text-primary)] leading-tight">{user.full_name || user.username}</p>
                                                                                <p className="text-[8px] text-[var(--text-secondary)]">@{user.username}</p>
                                                                            </div>
                                                                        </div>
                                                                        {selectedUsers.some(u => u.user_id === user.user_id) && (
                                                                            <Check className="h-3 w-3 text-[var(--primary)]" />
                                                                        )}
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>

                                                        {selectedUsers.length > 0 && (
                                                            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-[10px] text-blue-600 dark:text-blue-400 flex items-start gap-1.5">
                                                                <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="font-semibold">{selectedUsers.length} users selected</p>
                                                                    <p className="text-[8px] text-[var(--text-secondary)]">You can invite up to {roomData.maxMembers} users.</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {((inviteAll ? allUsers.length : selectedUsers.length) > roomData.maxMembers) && (
                                                            <div className="p-2 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl text-[10px] text-red-600 dark:text-red-400 flex items-start gap-1.5 animate-in shake duration-300">
                                                                <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                </svg>
                                                                <div>
                                                                    <p className="font-semibold">Selected Count Exceeded</p>
                                                                    <p className="text-[8px] text-red-500/85">Invites exceed capacity limit ({roomData.maxMembers}). Please reduce invite list.</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit & Cancel Footer */}
                            <div className="pt-4 border-t border-[var(--border-light)]/60 flex justify-end items-center gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-5 py-2 border border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-xl font-medium text-xs transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !roomData.name.trim() || ((roomData.isPrivate || roomData.isQuickChat) && selectedUsers.length === 0 && !inviteAll) || ((roomData.isPrivate || roomData.isQuickChat) && !inviteAll && selectedUsers.length > roomData.maxMembers)}
                                    className={`px-5 py-2 rounded-xl font-medium transition-all duration-200 text-xs ${isSubmitting || !roomData.name.trim() || ((roomData.isPrivate || roomData.isQuickChat) && selectedUsers.length === 0 && !inviteAll) || ((roomData.isPrivate || roomData.isQuickChat) && !inviteAll && selectedUsers.length > roomData.maxMembers)
                                        ? 'bg-[var(--surface-hover)] text-[var(--text-tertiary)] cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:opacity-90 shadow-lg shadow-indigo-600/10'
                                        }`}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Room'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Success Modal */}
            <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
                <div className="text-center p-8">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-bounce" />
                    
                    {!roomData.isQuickChat ? (
                        <>
                            {/* Standard Success Modal */}
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                                Room Created Successfully
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] mb-6">
                                Your Standard Room is ready.
                            </p>
                            
                            {/* Details List */}
                            <div className="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl p-4 text-left mb-6 space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-[var(--text-secondary)]">Room Name</span>
                                    <span className="font-semibold text-[var(--text-primary)]">{roomData.name}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-[var(--text-secondary)]">Visibility</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roomData.isPrivate ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        {roomData.isPrivate ? 'Private Room' : 'Public Room'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-[var(--text-secondary)]">Members Invited</span>
                                    <span className="font-semibold text-[var(--text-primary)]">
                                        {inviteAll ? 'All Users' : `${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-[var(--text-secondary)]">Capacity</span>
                                    <span className="font-semibold text-[var(--text-primary)]">{roomData.maxMembers} Members</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-[var(--text-secondary)]">Password</span>
                                    <span className="font-semibold text-[var(--text-primary)]">{roomData.hasPassword ? 'Securely Set' : 'Not Set'}</span>
                                </div>
                            </div>

                            {/* Green Alert Banner */}
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-left text-xs text-emerald-600 dark:text-emerald-400 mb-6 flex items-start gap-2">
                                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>Invitations have been sent to the selected users.</span>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Quick Chat Success Modal */}
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                                Quick Chat Room Created
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] mb-6">
                                Share this PIN with your invitees.
                            </p>

                            {/* ACCESS PIN Boxes */}
                            {roomData.pin && (
                                <div className="mb-6">
                                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold mb-2">ACCESS PIN</p>
                                    <div className="flex justify-center items-center gap-2">
                                        {roomData.pin.split('').map((char, index) => (
                                            <div key={index} className="w-12 h-14 bg-[var(--surface-light)] border-2 border-indigo-500 rounded-xl flex items-center justify-center text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 shadow-sm">
                                                {char}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Orange Alert Banner */}
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-left text-xs text-amber-600 dark:text-amber-400 mb-6 space-y-1">
                                <p className="font-semibold flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    This room will expire in {roomData.expiryDuration} Hours.
                                </p>
                                <p className="text-[var(--text-secondary)]">The room and chat history will be deleted after expiry.</p>
                            </div>
                        </>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center gap-3">
                        {roomData.isQuickChat && roomData.pin && (
                            <button
                                type="button"
                                onClick={() => handleCopyPin(roomData.pin)}
                                className="flex-1 py-3 px-4 border border-[var(--border-light)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-medium text-sm rounded-xl transition-colors duration-200"
                            >
                                {copiedPin ? 'Copied!' : 'Copy PIN'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleCreateAndJoin}
                            className={`py-3 px-4 bg-[var(--primary)] text-white font-medium text-sm rounded-xl hover:opacity-90 transition-opacity duration-200 ${roomData.isQuickChat ? 'flex-1' : 'w-full'}`}
                        >
                            Start Chatting
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CreateRoom;
