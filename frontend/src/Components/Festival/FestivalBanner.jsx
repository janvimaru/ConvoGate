import React, { useState, useEffect } from "react";
// Assuming you have an api utility or use simple fetch. 
// I'll use fetch for independence as requested ("independent components") or use the existing api instance if common.
// I'll stick to independent logic where possible but reusing project auth is needed.
// To be safe, I'll assume standard fetch for now, or check how other components do it.
// Checking previous history, there is an `api.jsx` in Utils.
import api from "../../Utils/api";

const FestivalBanner = ({ festival, isGroup, onOpenContributions, onClose }) => {
    if (!festival) return null;

    return (
        <div
            style={{
                backgroundColor: festival.theme_color || "#ff9800",
                color: "#fff",
                padding: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: "8px",
                marginBottom: "10px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>
                    {/* If icon is a URL, img tag. If specific string, mapped emoji/icon. For now assuming string or emoji */}
                    {festival.icon && festival.icon.includes("_") ? "🎉" : festival.icon}
                </span>
                <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>{festival.name} in progress!</h3>
                    <small>Celebrating together</small>
                </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
                {/* Indian Calendar Icon (if present) */}
                {/* Indian Calendar Icon (if present) */}
                {festival.calendar_icon && (
                    <div title="Indian Calendar" style={{
                        cursor: "pointer",
                        background: "rgba(255,255,255,0.2)",
                        padding: "5px 10px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "12px"
                    }}>
                        <span>📅</span>
                        {/* Display the icon string/url or just the text if it's a name like 'calendar_shiva' */}
                        <span style={{ fontWeight: "bold" }}>
                            {new Date(festival.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                )}

                {/* Contribution Tracker Button */}
                {isGroup && onOpenContributions && (
                    <button
                        onClick={onOpenContributions}
                        style={{
                            background: "rgba(255,255,255,0.2)",
                            border: "1px solid rgba(255,255,255,0.4)",
                            color: "white",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                        }}
                    >
                        💰 Contributions
                    </button>
                )}

                <button
                    onClick={onClose}
                    style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", fontSize: "16px" }}
                >
                    ✖
                </button>
            </div>
        </div>
    );
};

export default FestivalBanner;
