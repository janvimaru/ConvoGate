import React, { useState } from "react";
import api from "../../Utils/api";
import Modal from "../UI/Modal"; // Assuming existing Modal component

const GreetingGenerator = ({ isOpen, onClose, festivalId }) => {
    // Tone state removed - AI handles it automatically
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeFestivalId, setActiveFestivalId] = useState(festivalId);

    React.useEffect(() => {
        if (isOpen && !festivalId) {
            // Fetch current active
            api.get("/api/festival/current/").then(res => {
                if (res.data && res.data.found) {
                    setActiveFestivalId(res.data.festival_id);
                }
            });
        } else if (festivalId) {
            setActiveFestivalId(festivalId);
        }
    }, [isOpen, festivalId]);

    const handleGenerate = async () => {
        if (!activeFestivalId) {
            setMessages(["No active festival found."]);
            return;
        }
        setLoading(true);
        setMessages([]); // Clear previous
        try {
            // Send default tone, backend ignores it for Smart AI
            const response = await api.post("/api/festival/greeting/", {
                festival_id: activeFestivalId,
                tone: "AI_AUTO"
            });
            if (response.data && response.data.success) {
                const msgs = response.data.messages;
                if (Array.isArray(msgs)) {
                    setMessages(msgs);
                } else if (typeof msgs === 'string') {
                    setMessages([msgs]);
                } else if (response.data.message) {
                    setMessages([response.data.message]);
                }
            } else {
                setMessages(["Could not generate greeting."]);
            }
        } catch (error) {
            console.error("Greeting error:", error);
            setMessages(["Error generating greeting."]);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="✨ Festival Greetings">
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px", maxHeight: "80vh", overflowY: "auto" }}>
                <div className="text-gray-300 text-sm italic" style={{ color: "#aaa", textAlign: "center", marginBottom: "10px" }}>
                    Generate beautiful festival greetings instantly.
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{
                        padding: "12px",
                        borderRadius: "8px",
                        border: "none",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                        transition: "transform 0.1s"
                    }}
                    onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
                    onMouseUp={(e) => e.target.style.transform = "scale(1)"}
                >
                    {loading ? "Generating Magic... 🔮" : "Generate Greetings 🚀"}
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                    {messages.map((msg, index) => (
                        <div key={index} style={{
                            background: "#2a2a2a",
                            padding: "15px",
                            borderRadius: "10px",
                            borderLeft: "4px solid #764ba2",
                            position: "relative",
                            animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                        }}>
                            <p style={{ margin: "0 0 10px 0", color: "#eee", fontSize: "0.95rem", lineHeight: "1.5" }}>{msg}</p>
                            <button
                                onClick={() => copyToClipboard(msg)}
                                style={{
                                    padding: "6px 12px",
                                    background: "rgba(255,255,255,0.1)",
                                    color: "white",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    float: "right",
                                    transition: "all 0.2s"
                                }}
                                onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
                                onMouseOut={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
                            >
                                Copy
                            </button>
                            <div style={{ clear: "both" }}></div>
                        </div>
                    ))}
                </div>

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </Modal>
    );
};

export default GreetingGenerator;
