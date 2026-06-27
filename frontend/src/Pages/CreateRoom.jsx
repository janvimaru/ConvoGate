import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Hash, X, UserPlus, Check, Users, Globe, Zap, Clock } from 'lucide-react';
import Modal from '../Components/UI/Modal';
import { createRoomAPI, fetchAllUsersAPI } from "../Utils/api";

const CreateRoom = () => {
    const navigate = useNavigate();
    const [createdRoomId, setCreatedRoomId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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

        // Expiry calculation moved to backend/SQL to avoid timezone mismatch
        const expiryHours = roomData.isQuickChat ? parseInt(roomData.expiryDuration) : null;

        try {
            const res = await createRoomAPI({
                action: "create",
                name: roomData.name,
                description: roomData.description,
                isPrivate: roomData.isQuickChat ? 1 : (roomData.isPrivate ? 1 : 0),
                maxMembers: roomData.maxMembers,
                allowInvites: roomData.isQuickChat ? 0 : (roomData.allowInvites ? 1 : 0), // Quick Chat usually no invites? Or maybe yes? Let's say no for now to keep strict.
                hasPassword: roomData.isQuickChat ? 0 : (roomData.hasPassword ? 1 : 0),
                password: roomData.hasPassword ? roomData.password : null,
                invitedUsers: inviteAll ? [] : selectedUsers.map(u => u.user_id),
                inviteAll: inviteAll,
                isQuickChat: roomData.isQuickChat ? 1 : 0,
                expiryHours: expiryHours
            });

            setCreatedRoomId(res.data.room_id);

            // Store PIN if returned (for Quick Chat)
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
        <div className="p-8 bg-[var(--bg-secondary)] min-h-full transition-colors duration-300">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center space-x-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 mb-6"
                    >
                        <X className="h-4 w-4" />
                        <span>Back</span>
                    </button>

                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                        Create New Room
                    </h1>
                    <p className="text-[var(--text-secondary)]">
                        Set up a space for your conversations
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-8">
                        {/* Mode Toggle */}
                        <div className="bg-[var(--surface-light)] rounded-2xl p-1 border border-[var(--border-light)] flex">
                            <button
                                type="button"
                                onClick={() => {
                                    handleChange('isQuickChat', false);
                                    handleChange('isPrivate', false);
                                }}
                                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${!roomData.isQuickChat ? 'bg-[var(--surface-active)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                Standard Room
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleChange('isQuickChat', true);
                                    handleChange('isPrivate', true); // Quick Chat is always private
                                    setInviteAll(false); // Quick Chat usually specific people
                                }}
                                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${roomData.isQuickChat ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                <Zap className="w-4 h-4" />
                                Quick Chat
                            </button>
                        </div>

                        {/* Room Name */}
                        <div className="bg-[var(--surface-light)] rounded-2xl p-6 border border-[var(--border-light)]">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 rounded-lg bg-[var(--surface-hover)]">
                                    <Hash className="h-5 w-5 text-[var(--text-secondary)]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--text-primary)]">Room Name</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Choose a name that's easy to recognize
                                    </p>
                                </div>
                            </div>
                            <input
                                type="text"
                                value={roomData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="e.g., Design Team, Book Club, Family Chat"
                                className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200"
                                required
                                minLength={3}
                                maxLength={50}
                            />
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-[var(--text-tertiary)]">
                                    {roomData.name.length}/50 characters
                                </span>
                                <span className="text-xs text-[var(--text-tertiary)]">
                                    Minimum 3 characters
                                </span>
                            </div>
                        </div>

                        {/* Expiry Time - ONLY for Quick Chat */}
                        {roomData.isQuickChat && (
                            <div className="bg-[var(--surface-light)] rounded-2xl p-6 border border-[var(--border-light)] animate-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                                        <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[var(--text-primary)]">Expiry Time</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Room will auto-deactivate after this duration
                                        </p>
                                    </div>
                                </div>
                                <select
                                    value={roomData.expiryDuration}
                                    onChange={(e) => handleChange('expiryDuration', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200"
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

                        {/* Description - Hidden for Quick Chat */}
                        {!roomData.isQuickChat && (
                            <div className="bg-[var(--surface-light)] rounded-2xl p-6 border border-[var(--border-light)]">
                                <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                                    Description (Optional)
                                </h3>
                                <textarea
                                    value={roomData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="What's this room about?"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200 resize-none"
                                    maxLength={200}
                                />
                                <div className="text-right mt-2">
                                    <span className="text-xs text-[var(--text-tertiary)]">
                                        {roomData.description.length}/200 characters
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Privacy Settings - Hidden for Quick Chat (Always Private) */}
                        {!roomData.isQuickChat && (
                            <div className="bg-[var(--surface-light)] rounded-2xl p-6 border border-[var(--border-light)]">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 rounded-lg bg-[var(--surface-hover)]">
                                        <Lock className="h-5 w-5 text-[var(--text-secondary)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[var(--text-primary)]">Privacy Settings</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Control who can join and invite others
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div
                                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] cursor-pointer transition-colors duration-200"
                                        onClick={() => {
                                            const newIsPrivate = !roomData.isPrivate;
                                            handleChange('isPrivate', newIsPrivate);
                                            if (!newIsPrivate) {
                                                handleChange('maxMembers', 200);
                                                setInviteAll(true);
                                            } else {
                                                handleChange('maxMembers', 50);
                                                setInviteAll(false);
                                                setSelectedUsers([]);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${roomData.isPrivate ? 'bg-[var(--primary)]' : 'bg-[var(--surface-active)] border border-[var(--border-light)]'}`}>
                                                {roomData.isPrivate && <Check className="h-4 w-4 text-white" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-[var(--text-primary)]">Private Room</p>
                                                <p className="text-sm text-[var(--text-secondary)]">Only invited members can join</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-sm font-medium ${roomData.isPrivate ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-active)] text-[var(--text-primary)]'}`}>
                                            {roomData.isPrivate ? 'Private' : 'Public'}
                                        </div>
                                    </div>

                                    <div
                                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] cursor-pointer transition-colors duration-200"
                                        onClick={() => handleChange('allowInvites', !roomData.allowInvites)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${roomData.allowInvites ? 'bg-[var(--primary)]' : 'bg-[var(--surface-active)] border border-[var(--border-light)]'}`}>
                                                {roomData.allowInvites && <Check className="h-4 w-4 text-white" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-[var(--text-primary)]">Allow Member Invites</p>
                                                <p className="text-sm text-[var(--text-secondary)]">Members can invite others</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-sm font-medium ${roomData.allowInvites ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-active)] text-[var(--text-primary)]'}`}>
                                            {roomData.allowInvites ? 'Allowed' : 'Disabled'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Room Capacity - Only for Private Rooms or Quick Chat */}
                        {(roomData.isPrivate || roomData.isQuickChat) && (
                            <div className="bg-[var(--surface-light)] rounded-2xl p-6 border border-[var(--border-light)]">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 rounded-lg bg-[var(--surface-hover)]">
                                        <Users className="h-5 w-5 text-[var(--text-secondary)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[var(--text-primary)]">Room Capacity</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Set maximum number of members
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[var(--text-primary)]">Maximum Members</span>
                                        <span className={`text-lg font-semibold ${!inviteAll && selectedUsers.length > roomData.maxMembers
                                            ? 'text-red-500'
                                            : 'text-[var(--primary)]'
                                            }`}>
                                            {roomData.maxMembers}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="2"
                                        max="200"
                                        value={roomData.maxMembers}
                                        onChange={(e) => {
                                            const newMax = parseInt(e.target.value);
                                            handleChange('maxMembers', newMax);
                                            if (selectedUsers.length > newMax) {
                                                // Option: Trim immediately
                                                setSelectedUsers(selectedUsers.slice(0, newMax));
                                            }
                                        }}
                                        className="w-full h-2 bg-[var(--surface-hover)] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[var(--primary-gradient-from)] [&::-webkit-slider-thumb]:to-[var(--primary-gradient-to)]"
                                    />
                                    <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
                                        <span>2</span>
                                        <span>50</span>
                                        <span>200</span>
                                    </div>

                                    {/* Capacity Warning */}
                                    {((inviteAll ? allUsers.length : selectedUsers.length) > roomData.maxMembers) && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                                            Limit exceeded! You selected {inviteAll ? allUsers.length : selectedUsers.length} users but capacity is {roomData.maxMembers}. Please increase limit.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Invite Users - For Quick Chat we want to show this prominently (but maybe not invite all?) */}
                        {(roomData.isPrivate || roomData.isQuickChat) && (
                            <div className="bg-[var(--surface-light)] rounded-2xl p-6 border border-[var(--border-light)]">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 rounded-lg bg-[var(--surface-hover)]">
                                        <UserPlus className="h-5 w-5 text-[var(--text-secondary)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[var(--text-primary)]">Invite Users</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            {roomData.isQuickChat ? 'Select users to receive the Quick Chat PIN' : 'Select specific users to invite or invite all'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Invite All - Hide for Quick Chat? No, user might want to blast everyone */}
                                    <div
                                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] cursor-pointer transition-colors duration-200"
                                        onClick={toggleSelectAll}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${inviteAll ? 'bg-[var(--primary)]' : 'bg-[var(--surface-active)] border border-[var(--border-light)]'}`}>
                                                {inviteAll && <Check className="h-4 w-4 text-white" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-[var(--text-primary)]">Invite All Registered Users</p>
                                                <p className="text-sm text-[var(--text-secondary)]">
                                                    Send invitations to all {allUsers.length} users
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-sm font-medium ${inviteAll
                                            ? 'bg-[var(--primary)] text-white'
                                            : 'bg-[var(--surface-active)] text-[var(--text-primary)]'
                                            }`}>
                                            {inviteAll ? 'Selected' : 'Select'}
                                        </div>
                                    </div>

                                    {/* Search & User List */}
                                    {!inviteAll && (
                                        <>
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search users..."
                                                className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200"
                                            />

                                            {selectedUsers.length > 0 && (
                                                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                                            {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={clearAllSelections}
                                                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
                                                        >
                                                            Clear all
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--border-light)]">
                                                {isLoadingUsers ? (
                                                    <div className="p-8 text-center">
                                                        <div className="w-8 h-8 mx-auto mb-4 border-2 border-[var(--border-light)] border-t-[var(--primary)] rounded-full animate-spin"></div>
                                                        <p className="text-sm text-[var(--text-secondary)]">Loading users...</p>
                                                    </div>
                                                ) : filteredUsers.length === 0 ? (
                                                    <div className="p-8 text-center">
                                                        <UserPlus className="h-12 w-12 mx-auto mb-4 text-[var(--text-tertiary)]" />
                                                        <p className="text-sm text-[var(--text-secondary)]">
                                                            {searchQuery ? 'No users found' : 'No users available'}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    filteredUsers.map(user => (
                                                        <div
                                                            key={user.user_id}
                                                            onClick={() => toggleUserSelection(user)}
                                                            className={`p-4 hover:bg-[var(--surface-hover)] cursor-pointer transition-colors duration-200 ${selectedUsers.some(u => u.user_id === user.user_id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedUsers.some(u => u.user_id === user.user_id) ? 'bg-[var(--primary)]' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                                                                        {user.profile_pic ? (
                                                                            <img src={`http://127.0.0.1:8000/media/${user.profile_pic}`} className="w-full h-full rounded-lg object-cover" />
                                                                        ) : (
                                                                            <span className="text-white font-semibold">{getUserInitials(user)}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-medium text-[var(--text-primary)] truncate">
                                                                            {user.full_name || user.username}
                                                                        </p>
                                                                        <p className="text-sm text-[var(--text-secondary)] truncate">
                                                                            @{user.username}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {selectedUsers.some(u => u.user_id === user.user_id) && (
                                                                    <Check className="h-4 w-4 text-[var(--primary)]" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Password - Hidden for Quick Chat */}
                        {!roomData.isQuickChat && (
                            <div className="bg-[var(--surface-light)] rounded-2xl p-6 border border-[var(--border-light)]">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 rounded-lg bg-[var(--surface-hover)]">
                                        <Lock className="h-5 w-5 text-[var(--text-secondary)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[var(--text-primary)]">Password Protection</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Add a password for extra security
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div
                                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] cursor-pointer transition-colors duration-200"
                                        onClick={() => handleChange('hasPassword', !roomData.hasPassword)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${roomData.hasPassword ? 'bg-[var(--primary)]' : 'bg-[var(--surface-active)] border border-[var(--border-light)]'}`}>
                                                {roomData.hasPassword && <Check className="h-4 w-4 text-white" />}
                                            </div>
                                            <p className="font-medium text-[var(--text-primary)]">Enable Password Protection</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-sm font-medium ${roomData.hasPassword ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-active)] text-[var(--text-primary)]'}`}>
                                            {roomData.hasPassword ? 'Enabled' : 'Disabled'}
                                        </div>
                                    </div>

                                    {roomData.hasPassword && (
                                        <input
                                            type="password"
                                            value={roomData.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            placeholder="Enter room password"
                                            className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200"
                                            required
                                            minLength={4}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={isSubmitting || !roomData.name.trim() || ((roomData.isPrivate || roomData.isQuickChat) && selectedUsers.length === 0 && !inviteAll) || ((roomData.isPrivate || roomData.isQuickChat) && !inviteAll && selectedUsers.length > roomData.maxMembers)}
                            className={`w-full py-4 rounded-xl font-medium transition-all duration-200 ${isSubmitting || !roomData.name.trim() || ((roomData.isPrivate || roomData.isQuickChat) && selectedUsers.length === 0 && !inviteAll) || ((roomData.isPrivate || roomData.isQuickChat) && !inviteAll && selectedUsers.length > roomData.maxMembers)
                                ? 'bg-[var(--surface-hover)] text-[var(--text-tertiary)] cursor-not-allowed'
                                : 'bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-white hover:opacity-90 shadow-lg shadow-[var(--primary-shadow)]'
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Creating {roomData.isQuickChat ? 'Quick Chat' : 'Room'}...</span>
                                </div>
                            ) : (
                                `Create ${roomData.isQuickChat ? 'Quick Chat' : 'Room'}`
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Success Modal - Logic to choose between Quick Chat PIN popup or Standard Success popup */}
            {/* Success Modal */}
            <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
                <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 flex items-center justify-center">
                        <span className="text-3xl">🎉</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                        {roomData.isQuickChat ? 'Quick Chat Ready!' : 'Room Created Successfully!'}
                    </h3>
                    <p className="text-[var(--text-secondary)] mb-4">
                        Your {roomData.isQuickChat ? 'quick chat' : 'room'} "<span className="font-semibold">{roomData.name}</span>" is ready.
                    </p>

                    {roomData.isQuickChat && roomData.pin && (
                        <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                            <p className="text-xs uppercase tracking-widest text-indigo-500 font-bold mb-2">Access PIN</p>
                            <div className="text-4xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">
                                {roomData.pin}
                            </div>
                            <p className="text-xs text-indigo-400 mt-2">
                                This PIN has been sent to invited users.
                            </p>
                            <p className="text-xs text-orange-500 mt-1 font-semibold">
                                Alerts will be sent before expiry ({roomData.expiryDuration} hours).
                            </p>
                        </div>
                    )}

                    <p className="text-sm text-[var(--text-tertiary)] mb-8">
                        {inviteAll
                            ? 'Invitations sent to all registered users.'
                            : `${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''} invited.`}
                    </p>
                    <button
                        onClick={handleCreateAndJoin}
                        className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity duration-200"
                    >
                        Start Chatting
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default CreateRoom;
