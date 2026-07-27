import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import OTPInput from "../Components/UI/OTPInput";
import { joinRoomAPI } from "../Utils/api";

const JoinRoom = () => {
    const [pin, setPin] = useState("");
    const [status, setStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [otpKey, setOtpKey] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlPin = params.get("pin");
        if (urlPin && urlPin.length === 6) {
            setPin(urlPin);
            autoSubmitPin(urlPin);
        }
    }, []);

    const autoSubmitPin = async (pinValue) => {
        setIsLoading(true);
        try {
            const res = await joinRoomAPI(pinValue);
            if (res.data?.status === "pending") {
                setStatus("pending");
            } else if (res.data?.status === "joined") {
                navigate(`/chat/${res.data.room_id}`);
            }
        } catch (err) {
            alert(err.response?.data?.error || "Invalid or expired PIN");
            setPin("");
            setOtpKey((k) => k + 1);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePinSubmit = async (e) => {
        e.preventDefault();

        if (pin.length !== 6) {
            alert("Please enter a valid 6-digit PIN");
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        try {
            const res = await joinRoomAPI(pin);

            if (res.data?.status === "pending") {
                setStatus("pending");
            } else if (res.data?.status === "joined") {
                navigate(`/chat/${res.data.room_id}`);
            }
        } catch (err) {
            alert(err.response?.data?.error || "Invalid or expired PIN");
            setPin("");
            setOtpKey((k) => k + 1);
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "pending") {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
                <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    Waiting for Approval
                </h2>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed">
                    The room admin must approve your request to join this space.
                </p>
            </div>
        );
    }

    return (
        <div className="relative p-8 bg-[var(--bg-primary)] flex items-center justify-center min-h-full transition-colors duration-300">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-8 flex items-center space-x-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-xs font-semibold">Back</span>
            </button>

            <div className="max-w-sm w-full text-center space-y-6">
                <div>
                    {/* Primary Theme Lock Icon Box */}
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] flex items-center justify-center text-white shadow-lg shadow-indigo-600/10">
                        <Lock className="h-8 w-8" />
                    </div>

                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Join Room</h1>
                    <p className="text-xs text-[var(--text-secondary)]">
                        Enter the 6-digit PIN shared by the admin
                    </p>
                </div>

                <form onSubmit={handlePinSubmit} className="space-y-6">
                    <div className="flex justify-center">
                        <OTPInput
                            key={otpKey}
                            length={6}
                            onComplete={setPin}
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || pin.length !== 6}
                        className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] hover:opacity-95 text-white transition-all duration-200 shadow-lg shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {isLoading ? "Joining..." : "Join Room"}
                    </button>
                </form>

                {/* OR Divider */}
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-[var(--border-light)]/60"></div>
                    <span className="flex-shrink mx-4 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">OR</span>
                    <div className="flex-grow border-t border-[var(--border-light)]/60"></div>
                </div>

                {/* Info Card block */}
                <div className="p-4 rounded-xl bg-[var(--surface-light)]/50 border border-[var(--border-light)]/60 flex items-start space-x-3 text-left">
                    <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)] shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">Don't have a PIN?</h4>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                            Ask the room admin for the 6-digit room PIN.
                        </p>
                    </div>
                </div>

                {/* E2E Security Disclaimer */}
                <div className="pt-4 flex flex-col items-center text-center space-y-1">
                    <div className="flex items-center space-x-1.5 text-[10px] text-[var(--text-secondary)] justify-center">
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Rooms are secure and end-to-end encrypted.</span>
                    </div>
                    <p className="text-[9px] text-[var(--text-secondary)]">Your privacy is our priority.</p>
                </div>
            </div>
        </div>
    );
};

export default JoinRoom;
