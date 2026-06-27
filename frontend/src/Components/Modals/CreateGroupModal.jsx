import React, { useState, useRef } from "react";
import { X, Camera, Users, Loader2 } from "lucide-react";
import axios from "axios";

const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [avatar, setAvatar] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("media", file);

        setIsUploading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("http://127.0.0.1:8000/upload/chat-media/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data.success) {
                setAvatar(res.data.media_url);
            }
        } catch (err) {
            console.error("Avatar upload failed", err);
            alert("Failed to upload avatar.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsCreating(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                "http://127.0.0.1:8000/groups/create/",
                { name, description, avatar },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.data.success) {
                onSuccess(res.data.room_id);
                onClose();
            } else {
                alert(res.data.message || "Failed to create group.");
            }
        } catch (err) {
            console.error("Group creation failed", err);
            alert("Error creating group.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="p-2 bg-indigo-500/10 rounded-xl">
                                <Users className="h-6 w-6 text-indigo-500" />
                            </div>
                            New Group
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hovrer:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center">
                            <div
                                onClick={handleAvatarClick}
                                className="relative group cursor-pointer"
                            >
                                <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-700 overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95">
                                    {avatar ? (
                                        <img src={avatar} alt="Group" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400">
                                            {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-[10px] font-bold uppercase">Change</span>
                                    </div>
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        {/* Inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1 ml-1">Group Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="The Super Team..."
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1 ml-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What's this group about?"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!name.trim() || isCreating || isUploading}
                            className="w-full py-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
                        >
                            {isCreating ? "Creating..." : "Create Group"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;
