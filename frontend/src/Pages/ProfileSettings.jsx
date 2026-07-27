import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Key, Save, X, Camera, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { signupAPI } from '../Utils/api';
import { API_BASE } from '../Utils/constants';
import Modal from '../Components/UI/Modal';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Password Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match!');
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await signupAPI.changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword
      });

      if (response.data.success) {
        alert('Password changed successfully!');
        setIsPasswordModalOpen(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordError(response.data.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      setPasswordError(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getUserInitials = () => {
    if (profile.first_name && profile.last_name) return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    if (profile.first_name) return profile.first_name.slice(0, 2).toUpperCase();
    return profile.username?.slice(0, 2).toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs">Loading profile data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[var(--bg-primary)] transition-colors duration-300">
      <div className="max-w-5xl mx-auto pb-24">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button onClick={() => navigate(-1)} className="inline-flex items-center space-x-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4">
              <X className="h-4 w-4" /><span>Back</span>
            </button>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Profile Settings</h1>
            <p className="text-[var(--text-secondary)] mt-1">Manage your public information and account security settings</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="hidden md:flex items-center space-x-2 px-6 py-2.5 rounded-xl font-medium bg-indigo-600 hover:opacity-95 text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-70 text-sm"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Stripe/Vercel Grid Layout Sections */}
        <div className="space-y-12">
          
          {/* SECTION 1: Profile Identity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-[var(--border-light)]/60">
            <div className="lg:col-span-4">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Profile Identity</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                This is how you will appear to other users across ConvoGate.
              </p>
            </div>
            <div className="lg:col-span-8 bg-[var(--surface-light)] rounded-2xl p-6 border border-[var(--border-light)] shadow-sm flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group shrink-0">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[var(--avatar-from)] to-[var(--avatar-to)] flex items-center justify-center overflow-hidden ring-4 ring-[var(--surface-light)] shadow-md">
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
                <label className="absolute bottom-0 right-0 p-2 bg-[var(--bg-secondary)] hover:bg-[var(--surface-hover)] rounded-full shadow-md cursor-pointer transition-transform transform hover:scale-105 border border-[var(--border-light)]">
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  <Camera className="w-4 h-4 text-[var(--primary)]" />
                </label>
              </div>

              <div className="flex-1 w-full text-center sm:text-left space-y-2">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {profile.first_name || profile.last_name
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                    : profile.username}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">{profile.email}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-hover)] border border-[var(--border-light)] rounded-full text-xs font-semibold text-[var(--text-primary)] mt-1.5">
                  <User className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>Standard Account</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: General Information */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-[var(--border-light)]/60">
            <div className="lg:col-span-4">
              <h3 className="text-base font-bold text-[var(--text-primary)]">General Information</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                Update your contact details, bio, and personal details.
              </p>
            </div>
            <div className="lg:col-span-8 bg-[var(--surface-light)] rounded-2xl p-6 md:p-8 border border-[var(--border-light)] shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[var(--text-primary)]">First Name</label>
                  <input
                    type="text"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none text-sm text-[var(--text-primary)]"
                    placeholder="Enter first name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[var(--text-primary)]">Last Name</label>
                  <input
                    type="text"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none text-sm text-[var(--text-primary)]"
                    placeholder="Enter last name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[var(--text-primary)]">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none text-sm text-[var(--text-primary)]"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[var(--text-primary)]">Date of Birth</label>
                  <input
                    type="date"
                    value={profile.dob}
                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none text-sm text-[var(--text-primary)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[var(--text-primary)]">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none text-sm text-[var(--text-primary)]"
                    placeholder="e.g. New York, USA"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[var(--text-primary)]">Status Message</label>
                  <input
                    type="text"
                    value={profile.status_message}
                    onChange={(e) => setProfile({ ...profile, status_message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none text-sm text-[var(--text-primary)]"
                    placeholder="What's on your mind?"
                    maxLength={100}
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-[var(--text-primary)]">Bio</label>
                  <textarea
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none resize-none text-sm text-[var(--text-primary)]"
                    placeholder="Tell us a bit about yourself..."
                    maxLength={500}
                  />
                  <div className="text-right text-[10px] text-[var(--text-tertiary)] mt-1">
                    {(profile.bio || "").length}/500
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Account Security */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-[var(--border-light)]/60">
            <div className="lg:col-span-4">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Account Security</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                Update your security settings and change your password to keep your account safe.
              </p>
            </div>
            <div className="lg:col-span-8 bg-[var(--surface-light)] rounded-2xl p-6 border border-[var(--border-light)] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-[var(--bg-primary)] border border-[var(--border-light)]/60 rounded-2xl gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">Account Password</h4>
                  <p className="text-xs text-[var(--text-secondary)]">Change your account password securely here.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-4 py-2 bg-[var(--surface-light)] hover:bg-[var(--surface-hover)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-xl font-medium text-xs transition-colors shrink-0 self-start sm:self-auto"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Save Button */}
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-10">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3.5 rounded-xl font-bold bg-indigo-600 hover:opacity-95 text-white shadow-lg transition-opacity disabled:opacity-70 text-sm"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* SECURE PASSWORD MODAL (No prompt() alerts!) */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordError('');
        }}
        title="Change Password"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400">
              {passwordError}
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-primary)]">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-primary)]">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new password (min. 4 characters)"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all duration-200"
                required
                minLength={4}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-primary)]">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border-light)]/60">
            <button
              type="button"
              onClick={() => {
                setIsPasswordModalOpen(false);
                setPasswordError('');
              }}
              className="px-4 py-2 border border-[var(--border-light)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded-xl font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              className="px-4 py-2 bg-indigo-600 hover:opacity-95 text-white rounded-xl font-medium text-xs transition-opacity shadow-lg shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfileSettings;