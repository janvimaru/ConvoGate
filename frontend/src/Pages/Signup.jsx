import { useState, useRef } from "react";
import { API_BASE } from "../Utils/constants";

export default function Signup() {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        username: "",
        dob: "",
        phone: "",
        email: "",
        password: "",
        profile_pic: null,
    });

    const [profilePreview, setProfilePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, profile_pic: file });

            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const formData = new FormData();
            for (let key in form) {
                if (form[key]) formData.append(key, form[key]);
            }

            const response = await fetch(`${API_BASE}/signup/`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Signup failed");
            }

            setSuccess("Account created successfully! Redirecting...");
            setTimeout(() => window.location.href = "/login", 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            {/* Floating Orbs */}
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
            <div className="auth-orb auth-orb-3" />

            <div className="auth-card" style={{ maxWidth: '480px' }}>
                {/* Profile Picture Upload */}
                <div className="auth-stagger-1">
                    <div className="auth-avatar-wrap" onClick={triggerFileInput}>
                        <div className="auth-avatar">
                            {profilePreview ? (
                                <img src={profilePreview} alt="Profile" />
                            ) : (
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            )}
                        </div>
                        <div className="auth-avatar-overlay">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleProfilePicChange}
                        accept="image/*"
                        className="hidden"
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Header */}
                <div className="auth-stagger-2">
                    <h1 className="auth-title">Join ConvoGate</h1>
                    <p className="auth-subtitle">Create your account to get started</p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="auth-alert auth-alert-error">{error}</div>
                )}
                {success && (
                    <div className="auth-alert auth-alert-success">{success}</div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Name Row */}
                    <div className="auth-name-row auth-stagger-3">
                        <div className="auth-input-group">
                            <span className="auth-input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                name="first_name"
                                placeholder="First name"
                                value={form.first_name}
                                onChange={handleChange}
                                required
                                className="auth-input"
                            />
                        </div>
                        <div className="auth-input-group">
                            <span className="auth-input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                name="last_name"
                                placeholder="Last name"
                                value={form.last_name}
                                onChange={handleChange}
                                required
                                className="auth-input"
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div className="auth-input-group auth-stagger-4">
                        <span className="auth-input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>

                    {/* Date of Birth */}
                    <div className="auth-input-group auth-stagger-5">
                        <span className="auth-input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </span>
                        <input
                            type="date"
                            name="dob"
                            value={form.dob}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>

                    {/* Phone */}
                    <div className="auth-input-group auth-stagger-6">
                        <span className="auth-input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                        </span>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone number"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>

                    {/* Email */}
                    <div className="auth-input-group auth-stagger-7">
                        <span className="auth-input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </span>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>

                    {/* Password */}
                    <div className="auth-input-group auth-stagger-8">
                        <span className="auth-input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </span>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="auth-input"
                            style={{ paddingRight: '44px' }}
                        />
                        <button
                            type="button"
                            className="auth-pw-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Submit */}
                    <div className="auth-stagger-9">
                        <button
                            type="submit"
                            disabled={loading}
                            className="auth-btn"
                        >
                            {loading ? (
                                <><span className="auth-spinner" />Creating account...</>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="auth-footer auth-stagger-9">
                    Already have an account?
                    <a href="/login">Sign in</a>
                </div>
            </div>
        </div>
    );
}
