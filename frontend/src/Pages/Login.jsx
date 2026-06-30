import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { API_BASE } from "../Utils/constants";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axios.post(
                `${API_BASE}/login/`,
                {
                    username: form.username.trim(),
                    password: form.password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            // IMPORTANT: use AuthContext login
            login(res.data.user, res.data.token);

            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
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

            <div className="auth-card">
                {/* Logo */}
                <div className="auth-stagger-1">
                    <div className="auth-logo" style={{ width: 80, height: 80, borderRadius: 22, padding: 0, overflow: 'hidden', background: '#0d0a1a', boxShadow: '0 4px 24px rgba(139, 92, 246, 0.4)', border: '2px solid rgba(139, 92, 246, 0.3)' }}>
                        <img src="/convogate-logo.png" alt="ConvoGate" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 38%', transform: 'scale(1.4)' }} />
                    </div>
                </div>

                {/* Header */}
                <div className="auth-stagger-2">
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your ConvoGate account</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="auth-alert auth-alert-error">{error}</div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Username */}
                    <div className="auth-input-group auth-stagger-3">
                        <span className="auth-input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Username"
                            required
                            autoComplete="username"
                            className="auth-input"
                        />
                    </div>

                    {/* Password */}
                    <div className="auth-input-group auth-stagger-4">
                        <span className="auth-input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </span>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                            autoComplete="current-password"
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

                    {/* Forgot Password */}
                    <a href="#" className="auth-forgot auth-stagger-5">
                        Forgot password?
                    </a>

                    {/* Submit */}
                    <div className="auth-stagger-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="auth-btn"
                        >
                            {loading ? (
                                <><span className="auth-spinner" />Signing in...</>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="auth-footer auth-stagger-7">
                    Don't have an account?
                    <a href="/signup">Sign up</a>
                </div>
            </div>
        </div>
    );
}
