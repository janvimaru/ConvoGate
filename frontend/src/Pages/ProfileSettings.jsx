import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Key, Save, X, Camera, Lock } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { signupAPI } from '../Utils/api';
import { API_BASE } from '../Utils/constants';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Profile state
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    status_message: '',
    dob: '',
    phone: '',
    location: '',
    profile_pic: null,
  });

  // Load user data from API
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const response = await signupAPI.getCurrentUser();
        const userData = response.data;
        setProfile({
          username: userData.username || '',
          email: userData.email || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          bio: userData.bio || '',
          status_message: userData.status_message || '',
          dob: userData.dob || '',
          phone: userData.phone || '',
          location: userData.location || '',
          profile_pic: userData.profile_pic,
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, [authUser]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const profileData = {
        username: profile.username,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        bio: profile.bio,
        status_message: profile.status_message,
        phone: profile.phone,
        location: profile.location,
        dob: profile.dob,
      };

      const response = await signupAPI.updateProfile(profileData);

      if (response.data.success || response.status === 200) {
        // Update local auth context with new data
        const updatedUser = { ...authUser, ...profileData, profile_pic: profile.profile_pic };
        updateUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('profile_pic', file);

      // Optimistic preview
      const objectUrl = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, profile_pic: objectUrl }));

      const response = await signupAPI.uploadProfilePicture(formData);

      if (response.data.profile_pic) {
        // Update with server path after success
        setProfile(prev => ({ ...prev, profile_pic: response.data.profile_pic }));
        updateUser({ ...authUser, profile_pic: response.data.profile_pic });
        alert('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload profile picture.');
      // Revert if failed (optional, but good practice would be to reload original)
    }
  };

  const handleChangePassword = async () => {
    const currentPassword = prompt('Enter current password:');
    if (!currentPassword) return;
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;
    const confirmPassword = prompt('Confirm new password:');
    if (newPassword !== confirmPassword) { alert('Passwords do not match!'); return; }

    try {
      const response = await signupAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      if (response.data.success) alert('Password changed successfully!');
      else alert(response.data.message || 'Failed to change password.');
    } catch (error) {
      console.error('Failed to change password:', error);
      alert(error.response?.data?.message || 'Failed to change password.');
    }
  };

  const getUserInitials = () => {
    if (profile.first_name && profile.last_name) return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    if (profile.first_name) return profile.first_name.slice(0, 2).toUpperCase();
    return profile.username?.slice(0, 2).toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[var(--bg-secondary)] min-h-full transition-colors duration-300">
      <div className="max-w-4xl mx-auto pb-20">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button onClick={() => navigate(-1)} className="inline-flex items-center space-x-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4">
              <X className="h-4 w-4" /><span>Back</span>
            </button>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Edit Profile</h1>
            <p className="text-[var(--text-secondary)] mt-1">Manage your personal information</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="hidden md:flex items-center space-x-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-white hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-70"
          >
            <Save className="h-5 w-5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        <div className="space-y-8">

          {/* Main Profile Card */}
          <div className="bg-[var(--surface-light)] rounded-2xl p-6 md:p-8 border border-[var(--border-light)] shadow-sm">

            {/* Avatar Section */}
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 mb-8 pb-8 border-b border-[var(--border-light)]">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--avatar-from)] to-[var(--avatar-to)] flex items-center justify-center overflow-hidden ring-4 ring-[var(--surface-light)] shadow-md">
                  {profile.profile_pic ? (
                    <img
                      src={
                        profile.profile_pic.startsWith('blob:') || profile.profile_pic.startsWith('data:')
                          ? profile.profile_pic
                          : `${API_BASE}/media/${profile.profile_pic}`
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">{getUserInitials()}</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-3 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-transform transform hover:scale-105 border border-gray-100">
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  <Camera className="w-5 h-5 text-[var(--primary)]" />
                </label>
              </div>

              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  {profile.first_name && profile.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile.first_name || profile.username}
                </h3>
                <p className="text-[var(--text-secondary)] mb-4">{profile.email}</p>
                <div className="inline-flex">
                  <button onClick={() => document.querySelector('input[type="file"]').click()} className="px-4 py-2 rounded-lg bg-[var(--surface-hover)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--surface-active)] transition-colors">
                    Change Picture
                  </button>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">First Name</label>
                <input
                  type="text"
                  value={profile.first_name}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Last Name</label>
                <input
                  type="text"
                  value={profile.last_name}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none text-[var(--text-primary)]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={profile.dob}
                  onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none text-[var(--text-primary)]"
                  placeholder="e.g. New York, USA"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Status Message</label>
                <input
                  type="text"
                  value={profile.status_message}
                  onChange={(e) => setProfile({ ...profile, status_message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none text-[var(--text-primary)]"
                  placeholder="What's on your mind?"
                  maxLength={100}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Bio</label>
                <textarea
                  value={profile.bio || ""}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none resize-none text-[var(--text-primary)]"
                  placeholder="Tell us a bit about yourself..."
                  maxLength={500}
                />
                <div className="text-right text-xs text-[var(--text-tertiary)] mt-1">
                  {(profile.bio || "").length}/500
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-[var(--surface-light)] rounded-2xl p-6 md:p-8 border border-[var(--border-light)] shadow-sm">
            <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[var(--secondary-color)]" />
              Security
            </h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-light)]/50">
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">Password</h4>
                <p className="text-sm text-[var(--text-secondary)]">Change your account password secure your account.</p>
              </div>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-[var(--surface-active)] hover:bg-[var(--border-light)] text-[var(--text-primary)] rounded-lg font-medium text-sm transition-colors border border-[var(--border-light)]"
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Mobile Save Button */}
          <div className="md:hidden sticky bottom-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-white shadow-lg disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;