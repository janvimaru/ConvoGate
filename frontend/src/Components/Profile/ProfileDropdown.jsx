import React, { useState, useEffect, useRef } from 'react';
import { User, Settings, Bell, Sun, Moon, LogOut, Mail, Phone, Calendar, Edit } from 'lucide-react';
import { useTheme } from '../../Context/ThemeContext';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ToggleSwitch from '../UI/ToggleSwitch';
import { API_BASE } from '../../Utils/constants';

const ProfileDropdown = ({ getUserInitials, username, userData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { user: authUser, token, logout } = useAuth();

    // Use userData from props or auth context
    useEffect(() => {
        if (userData) {
            setProfileData(userData);
        } else if (authUser) {
            setProfileData(authUser);
        }
    }, [userData, authUser]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get full name from user data
    const getFullName = () => {
        if (!profileData) return 'User';
        if (profileData.first_name && profileData.last_name) {
            return `${profileData.first_name} ${profileData.last_name}`;
        }
        if (profileData.full_name) {
            return profileData.full_name;
        }
        return profileData.username || 'User';
    };

    // Get user initials
    const getProfileInitials = () => {
        if (getUserInitials) {
            return getUserInitials();
        }
        if (!profileData) return 'U';
        if (profileData.first_name && profileData.last_name) {
            return `${profileData.first_name[0]}${profileData.last_name[0]}`.toUpperCase();
        }
        return profileData?.username?.slice(0, 2).toUpperCase() || 'U';
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    // Handle profile settings
    const handleProfileSettings = () => {
        navigate('/profile');
        setIsOpen(false);
    };

    const menuItems = [
        { icon: User, label: 'My Profile', onClick: handleProfileSettings },
        { icon: LogOut, label: 'Logout', onClick: handleLogout, danger: true },
    ];

    // Check if profile picture exists
    const hasProfilePic = profileData?.profile_pic && !imageError;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Avatar */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
            >
                {hasProfilePic ? (
                    <img
                        src={`${API_BASE}/media/${profileData.profile_pic}`}
                        alt={getFullName()}
                        className="w-9 h-9 rounded-lg object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-sm">
                        <span className="text-[var(--avatar-text)] font-semibold">{getProfileInitials()}</span>
                    </div>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                // <div className="absolute right-0 mt-2 w-80 bg-bg-card border border-border-light rounded-xl shadow-xl overflow-hidden z-[9999]">
                <div className="
  absolute right-0 mt-2 w-80
  bg-[var(--glass-dropdown-bg)]
  backdrop-blur-xl
  border border-[var(--glass-dropdown-border)]
  rounded-xl shadow-2xl
  z-[9999]
  text-[var(--glass-dropdown-text)]
">


                    {/* User Info */}
                    <div className="p-4 border-b border-[var(--glass-dropdown-border)]">
                        <div className="flex items-start space-x-3">
                            {/* Profile Image or Initials */}
                            {hasProfilePic ? (
                                <img
                                    src={`${API_BASE}/media/${profileData.profile_pic}`}
                                    alt={getFullName()}
                                    className="w-12 h-12 rounded-lg object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                                    <span className="font-semibold text-[var(--avatar-text)]">
                                        {getProfileInitials()}
                                    </span>                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-[var(--glass-dropdown-text)] text-lg">{getFullName()}</h4>
                                        <p className="text-sm text-[var(--glass-dropdown-text)] opacity-70 truncate">
                                            @{profileData?.username || 'username'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/profile/edit')}
                                        className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                                    >
                                        <Edit className="w-4 h-4 text-[var(--glass-dropdown-text)] opacity-80" />
                                    </button>
                                </div>

                                {/* User Details */}
                                <div className="mt-3 space-y-2">
                                    {profileData?.email && (
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-3.5 h-3.5 text-[var(--glass-dropdown-text)] opacity-80" />
                                            <span className="text-xs text-[var(--glass-dropdown-text)] opacity-90 truncate">
                                                {profileData.email}
                                            </span>
                                        </div>
                                    )}

                                    {profileData?.phone && (
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-3.5 h-3.5 text-[var(--glass-dropdown-text)] opacity-80" />
                                            <span className="text-xs text-[var(--glass-dropdown-text)] opacity-90">
                                                {profileData.phone}
                                            </span>
                                        </div>
                                    )}

                                    {profileData?.dob && (
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-3.5 h-3.5 text-[var(--glass-dropdown-text)] opacity-80" />
                                            <span className="text-xs text-[var(--glass-dropdown-text)] opacity-90">
                                                {formatDate(profileData.dob)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    item.onClick();
                                    setIsOpen(false);
                                }}
                                className={`
                  w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors
                  ${item.danger
                                        ? 'text-[var(--accent-danger)] hover:bg-[var(--accent-danger)]/10'
                                        : 'text-[var(--glass-dropdown-text)] hover:bg-[var(--surface-hover)]'
                                    }
                `}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Settings */}

                    <div className="p-4 border-t border-[var(--glass-dropdown-border)] space-y-3">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--glass-dropdown-text)]">Theme</span>
                            <button
                                onClick={toggleTheme}
                                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                            >
                                {theme === 'light' ? (
                                    <>
                                        <Moon className="w-4 h-4 text-[var(--glass-dropdown-text)] opacity-80" />
                                        <span className="text-sm text-[var(--glass-dropdown-text)] opacity-90">Dark</span>
                                    </>
                                ) : (
                                    <>
                                        <Sun className="w-4 h-4 text-[var(--glass-dropdown-text)] opacity-80" />
                                        <span className="text-sm text-[var(--glass-dropdown-text)] opacity-90">Light</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Account Info */}
                        {profileData?.created_at && (
                            <div className="pt-2 border-t border-[var(--glass-dropdown-border)]">
                                <p className="text-xs text-[var(--glass-dropdown-text)] opacity-60 text-center">
                                    Member since {formatDate(profileData.created_at)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;