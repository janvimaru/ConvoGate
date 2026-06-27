import React, { useState, useRef } from "react";

const OTPInput = ({ length = 6, onComplete, disabled = false }) => {
    const [pin, setPin] = useState(Array(length).fill(""));
    const inputsRef = useRef([]);

    const handleChange = (value, index) => {
        if (disabled) return;
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);

        // Move to next input
        if (value && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }

        // ✅ Call ONLY when full PIN entered
        if (newPin.every(d => d !== "") && typeof onComplete === "function") {
            onComplete(newPin.join(""));
        }
    };

    const handleKeyDown = (e, index) => {
        if (disabled) return;

        if (e.key === "Backspace" && !pin[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        if (disabled) return;

        e.preventDefault();
        const pasteData = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, length);

        const newPin = [...pin];
        pasteData.split("").forEach((char, index) => {
            newPin[index] = char;
        });

        setPin(newPin);

        if (newPin.every(d => d !== "") && typeof onComplete === "function") {
            onComplete(newPin.join(""));
        }
    };

    return (
        <div className="flex justify-center space-x-3">
            {pin.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    disabled={disabled}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    className="w-14 h-14 text-center text-2xl font-bold rounded-xl
                               bg-[var(--bg-input)]
                               border-2 border-[var(--border-light)]
                               focus:border-[var(--primary-color)]
                               focus:outline-none
                               text-[var(--text-primary)]
                               disabled:opacity-50"
                />
            ))}
        </div>
    );
};

export default OTPInput;
