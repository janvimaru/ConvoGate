// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { Mail, Phone, Calendar, User, Edit } from 'lucide-react';
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
        return <div>Loading...</div>;
    }

    const currentUser = userDetails || user;

    return (
        <div className="min-h-screen bg-[var(--background)] p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">My Profile</h1>

                <div className="bg-[var(--surface-elevated)] rounded-xl p-8 shadow-lg">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-6">
                            {currentUser?.profile_pic ? (
                                <img
                                    src={`${API_BASE}/media/${currentUser.profile_pic}`}
                                    alt={`${currentUser.first_name} ${currentUser.last_name}`}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-[var(--primary)]"
                                />
                            ) : (
                                <div className="w-32 h-32 bg-gradient-to-br from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] rounded-full flex items-center justify-center border-4 border-[var(--primary)]">
                                    <span className="text-white font-bold text-4xl">
                                        {currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                                    {currentUser?.first_name} {currentUser?.last_name}
                                </h2>
                                <p className="text-[var(--text-tertiary)]">@{currentUser?.username}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/profile/edit')}
                            className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            <Edit size={18} />
                            <span>Edit Profile</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-[var(--surface-subtle)]">
                                <div className="flex items-center space-x-3 mb-2">
                                    <Mail className="text-[var(--text-tertiary)]" />
                                    <h3 className="font-semibold text-[var(--text-primary)]">Email</h3>
                                </div>
                                <p className="text-[var(--text-secondary)]">{currentUser?.email}</p>
                            </div>

                            <div className="p-4 rounded-lg bg-[var(--surface-subtle)]">
                                <div className="flex items-center space-x-3 mb-2">
                                    <Phone className="text-[var(--text-tertiary)]" />
                                    <h3 className="font-semibold text-[var(--text-primary)]">Phone</h3>
                                </div>
                                <p className="text-[var(--text-secondary)]">{currentUser?.phone || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-[var(--surface-subtle)]">
                                <div className="flex items-center space-x-3 mb-2">
                                    <Calendar className="text-[var(--text-tertiary)]" />
                                    <h3 className="font-semibold text-[var(--text-primary)]">Date of Birth</h3>
                                </div>
                                <p className="text-[var(--text-secondary)]">
                                    {currentUser?.dob ? new Date(currentUser.dob).toLocaleDateString() : 'Not provided'}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-[var(--surface-subtle)]">
                                <div className="flex items-center space-x-3 mb-2">
                                    <User className="text-[var(--text-tertiary)]" />
                                    <h3 className="font-semibold text-[var(--text-primary)]">Member Since</h3>
                                </div>
                                <p className="text-[var(--text-secondary)]">
                                    {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
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