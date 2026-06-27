import React, { useState, useEffect } from "react";
import api from "../../Utils/api";
import Modal from "../UI/Modal";

const ContributionTracker = ({ isOpen, onClose, groupId }) => {
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(false);

    // For adding new contribution
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState("Pending");

    useEffect(() => {
        if (isOpen && groupId) {
            fetchContributions();
        }
    }, [isOpen, groupId]);

    const fetchContributions = async () => {
        setLoading(true);
        try {
            // Assuming groupId is room_id or similar
            const response = await api.post("/api/festival/contribution/", {
                action: "get",
                group_id: groupId
            });
            if (response.data && response.data.success) {
                setContributions(response.data.contributions);
            }
        } catch (error) {
            console.error("Fetch contributions error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        try {
            await api.post("/api/festival/contribution/", {
                action: "add",
                group_id: groupId,
                amount: amount,
                status: status
            });
            fetchContributions(); // Refresh
            setAmount("");
        } catch (error) {
            console.error("Add contribution error:", error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="💰 Festival Contributions">
            <div style={{ padding: "15px", maxHeight: "400px", overflowY: "auto" }}>

                {/* Add New */}
                <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #444", background: "#222", color: "white", width: "80px" }}
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #444", background: "#222", color: "white" }}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                    </select>
                    <button
                        onClick={handleAdd}
                        style={{ padding: "8px 15px", background: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                        Add Me
                    </button>
                </div>

                {/* List */}
                {loading ? <p>Loading...</p> : (
                    <table style={{ width: "100%", borderCollapse: "collapse", color: "#ddd" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #444", textAlign: "left" }}>
                                <th style={{ padding: "8px" }}>Member</th>
                                <th style={{ padding: "8px" }}>Amount</th>
                                <th style={{ padding: "8px" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contributions.map((c, i) => (
                                <tr key={i} style={{ borderBottom: "1px solid #333" }}>
                                    <td style={{ padding: "8px" }}>{c.user_name || "User " + c.user_id}</td>
                                    <td style={{ padding: "8px" }}>₹{c.amount}</td>
                                    <td style={{ padding: "8px" }}>
                                        <span style={{
                                            padding: "2px 6px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            background: c.status === "Paid" ? "#4CAF50" : "#FF9800",
                                            color: "white"
                                        }}>
                                            {c.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {contributions.length === 0 && <tr><td colSpan="3" style={{ padding: "10px", textAlign: "center", color: "#777" }}>No contributions yet.</td></tr>}
                        </tbody>
                    </table>
                )}

            </div>
        </Modal>
    );
};

export default ContributionTracker;
