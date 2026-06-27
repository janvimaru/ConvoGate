import React, { useState } from "react";
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
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    ⏳ Waiting for approval
                </h2>
                <p className="text-[var(--text-secondary)] mt-2">
                    The room admin must approve your request
                </p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-[var(--bg-secondary)] min-h-full">
            <div className="max-w-md mx-auto text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] flex items-center justify-center">
                    <Lock className="h-8 w-8 text-white" />
                </div>

                <h1 className="text-3xl font-bold mb-2">Join Room</h1>
                <p className="text-[var(--text-secondary)] mb-8">
                    Enter the 6-digit PIN shared by the admin
                </p>

                <form onSubmit={handlePinSubmit} className="space-y-6">
                    <OTPInput
                        key={otpKey}
                        length={6}
                        onComplete={setPin}
                        disabled={isLoading}
                    />

                    <button
                        type="submit"
                        disabled={isLoading || pin.length !== 6}
                        className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-white"
                    >
                        {isLoading ? "Submitting..." : "Join Room"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinRoom;
