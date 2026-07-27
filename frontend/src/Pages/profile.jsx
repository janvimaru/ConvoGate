// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { Mail, Phone, Calendar, User, Edit, MapPin, FileText, ArrowLeft } from 'lucide-react';
import { API_BASE } from '../Utils/constants';

const Profile = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/user/profile/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                        setUserDetails(data.user);
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchUserProfile();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)]">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Loading profile...</span>
                </div>
            </div>
        );
    }

    const currentUser = userDetails || user;

    const getUserInitials = () => {
        if (currentUser?.first_name && currentUser?.last_name) {
            return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
        }
        return currentUser?.username?.slice(0, 2).toUpperCase() || 'U';
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[var(--bg-primary)] transition-colors duration-300">
            <div className="max-w-4xl mx-auto pb-20">
                {/* Header Navigation */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center space-x-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back</span>
                    </button>
                </div>

                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">My Profile</h1>

                {/* Main Profile Showcase Card */}
                <div className="bg-[var(--surface-light)] border border-[var(--border-light)] rounded-2xl p-6 md:p-8 shadow-sm space-y-8 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div className="flex items-center space-x-5">
                            {currentUser?.profile_pic ? (
                                <img
                                    src={`${API_BASE}/media/${currentUser.profile_pic}`}
                                    alt={`${currentUser.first_name} ${currentUser.last_name}`}
                                    className="w-24 h-24 rounded-full object-cover border-2 border-[var(--border-light)] shadow-sm"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] rounded-full flex items-center justify-center shadow-md">
                                    <span className="text-white font-bold text-3xl">
                                        {getUserInitials()}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                    {currentUser?.first_name || currentUser?.last_name
                                        ? `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim()
                                        : currentUser?.username
                                    }
                                </h2>
                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">@{currentUser?.username}</p>
                                {currentUser?.status_message && (
                                    <p className="text-[11px] italic text-[var(--text-muted)] mt-1.5 bg-[var(--bg-primary)] px-2.5 py-1 rounded-lg border border-[var(--border-light)]/40 inline-block">
                                        "{currentUser.status_message}"
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/profile/edit')}
                            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:opacity-95 text-white font-semibold rounded-xl text-xs transition-opacity shadow-lg shadow-indigo-600/10 shrink-0 self-start sm:self-auto"
                        >
                            <Edit size={14} />
                            <span>Edit Profile</span>
                        </button>
                    </div>

                    {/* Details Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-light)]/60 flex items-start space-x-3.5">
                            <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg shrink-0">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address</span>
                                <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5 truncate">{currentUser?.email}</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-light)]/60 flex items-start space-x-3.5">
                            <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg shrink-0">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Phone Number</span>
                                <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{currentUser?.phone || 'Not provided'}</p>
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-light)]/60 flex items-start space-x-3.5">
                            <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg shrink-0">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Date of Birth</span>
                                <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">
                                    {currentUser?.dob ? new Date(currentUser.dob).toLocaleDateString() : 'Not provided'}
                                </p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-light)]/60 flex items-start space-x-3.5">
                            <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg shrink-0">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Location</span>
                                <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{currentUser?.location || 'Not provided'}</p>
                            </div>
                        </div>

                        {/* Member Since */}
                        <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-light)]/60 flex items-start space-x-3.5">
                            <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg shrink-0">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Member Since</span>
                                <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">
                                    {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Biography / Description (Full width on md screens) */}
                        <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-light)]/60 flex items-start space-x-3.5 md:col-span-2">
                            <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg shrink-0">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Biography</span>
                                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                                    {currentUser?.bio || 'No biography details provided.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;