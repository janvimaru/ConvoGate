


import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, Mic, X, Loader2, Music, Video, FileText, Image as ImageIcon, Sparkles, Calendar, CreditCard, Plus } from "lucide-react";
import axios from "axios";
import IndianCalendar from "./IndianCalendar";
// CreateExpenseModal hoisted to ChatRoom

const ChatInput = ({
    onSendMessage,
    onTyping,
    replyTo,
    onCancelReply,
    placeholder = "Type your message...",
    isReadOnly = false,
    onFestivalClick,
    activeFestival,
    onOpenContributions,
    isGroup,
    roomId,
    onOpenExpenseModal
}) => {
    const [message, setMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [festivalMenuOpen, setFestivalMenuOpen] = useState(false);
    const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    // const [showExpenseModal, setShowExpenseModal] = useState(false); // Removed local state


    console.log("ChatInput Rendered. isGroup:", isGroup, "roomId:", roomId);

    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const recognitionRef = useRef(null);

    // Handle message change with typing indicator
    const handleMessageChange = (e) => {
        const val = e.target.value;
        setMessage(val);

        if (onTyping) {
            if (!typingTimeoutRef.current) {
                onTyping(true);
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                onTyping(false);
                typingTimeoutRef.current = null;
            }, 3000);
        }
    };

    // Handle message submit
    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!message.trim() && !previewFile) return;

        if (onTyping) {
            onTyping(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
        }

        if (previewFile) {
            uploadMedia(previewFile);
            setPreviewFile(null);
        } else {
            onSendMessage({ content: message, message_type: "text" });
            setMessage("");
        }
    };

    // Handle Enter key
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // File handling
    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreviewFile(file);
        e.target.value = "";
    };

    // Drag & Drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) setPreviewFile(file);
    };

    // Speech to Text
    const toggleDictation = useCallback(async () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        // Check microphone permission
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            alert("Cannot access microphone. Please check permissions.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech error:', event.error);
            setIsListening(false);
            if (event.error !== 'no-speech') {
                alert(`Speech recognition error: ${event.error}`);
            }
        };

        recognition.onresult = (event) => {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = 0; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (interimTranscript) {
                setMessage(interimTranscript);
            }

            if (finalTranscript) {
                setMessage(prev => (prev ? prev + " " : "") + finalTranscript);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [isListening]);

    // Upload Media
    const uploadMedia = async (file) => {
        const formData = new FormData();
        formData.append("media", file);

        setIsUploading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                "http://127.0.0.1:8000/upload/chat-media/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data.success) {
                let messageType = "document";
                if (file.type.startsWith("image/")) messageType = "image";
                if (file.type.startsWith("video/")) messageType = "video";
                if (file.type.startsWith("audio/")) messageType = "voice";

                onSendMessage({
                    content: file.name,
                    message_type: messageType,
                    voice_url: res.data.media_url,
                });
            }
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload media.");
        } finally {
            setIsUploading(false);
        }
    };

    // Handle greeting insertion from calendar
    const handleInsertGreeting = (greeting) => {
        setMessage(greeting);
        setShowCalendar(false);
        setAiSuggestions([]); // Clear bar when one is picked
    };

    const handleGreetingsGenerated = (greetings) => {
        setAiSuggestions(greetings);
        setShowCalendar(false);
    };

    return (
        <div
            className={`sticky bottom-0 bg-[var(--bg-secondary)]/70 backdrop-blur-xl border-t border-[var(--border-light)] transition-all duration-300 z-50 ${isDragging ? "bg-indigo-500/10 ring-2 ring-indigo-500 ring-inset" : ""
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="p-4 max-w-5xl mx-auto">
                {/* File Preview */}
                {previewFile && (
                    <div className="mb-2 p-3 bg-[var(--message-received-bg)] rounded-xl border border-[var(--border-light)] shadow-sm flex items-center justify-between animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                {previewFile.type.startsWith("image/") ? (
                                    <ImageIcon className="h-4 w-4 text-indigo-500" />
                                ) : previewFile.type.startsWith("video/") ? (
                                    <Video className="h-4 w-4 text-indigo-500" />
                                ) : previewFile.type.startsWith("audio/") ? (
                                    <Music className="h-4 w-4 text-indigo-500" />
                                ) : (
                                    <FileText className="h-4 w-4 text-indigo-500" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                                    {previewFile.name}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    {(previewFile.size / 1024).toFixed(0)} KB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPreviewFile(null)}
                            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Reply Preview */}
                {replyTo && (
                    <div className="mb-2 p-3 bg-white dark:bg-slate-800 rounded-xl border-l-4 border-indigo-500 shadow-sm flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">
                                Replying to {replyTo.senderName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 italic">
                                "{replyTo.text}"
                            </p>
                        </div>
                        <button
                            onClick={onCancelReply}
                            className="ml-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* AI Suggestions (Premium Vertical Cards) */}
                {aiSuggestions.length > 0 && (
                    <div className="mb-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 px-1 mb-1">
                            <Sparkles className="h-4 w-4 text-orange-400" />
                            <span className="text-white font-black text-xs uppercase tracking-widest">Gemini Suggestions</span>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            {aiSuggestions.map((g, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleInsertGreeting(g)}
                                    className="text-left w-full p-4 bg-[#1a1c2e] border border-white/5 rounded-[20px] hover:border-orange-500/40 transition-all group relative overflow-hidden shadow-2xl"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-rose-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                    <p className="text-slate-300 text-sm leading-relaxed font-medium">{g}</p>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setAiSuggestions([])}
                            className="self-center mt-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors"
                        >
                            Dismiss Suggestions
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* Input Area */}
                    <div className="relative group">
                        {isReadOnly ? (
                            <div className="w-full py-4 px-6 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-light)] text-[var(--text-secondary)] text-center font-medium italic shadow-inner">
                                This conversation is now read-only.
                            </div>
                        ) : (
                            <>
                                <textarea
                                    value={message}
                                    onChange={handleMessageChange}
                                    onKeyDown={handleKeyDown}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                                    }}
                                    placeholder={
                                        isListening
                                            ? "Listening..."
                                            : isUploading
                                                ? "Uploading..."
                                                : placeholder
                                    }
                                    disabled={isUploading}
                                    rows={1}
                                    className={`w-full pl-6 pr-56 py-4 rounded-2xl bg-[var(--input-bg)]/50 border ${isListening
                                        ? 'border-amber-500 ring-2 ring-amber-500/20'
                                        : 'border-[var(--border-light)]'
                                        } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] resize-none transition-all duration-300 overflow-y-auto shadow-inner custom-scrollbar`}
                                    style={{ minHeight: "58px", maxHeight: "150px" }}
                                />

                                {/* Action Buttons */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1.5 px-2">
                                    {/* Attachment Menu Wrapper */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
                                            disabled={isUploading}
                                            className={`p-2.5 rounded-xl transition-all duration-200 active:scale-90 ${attachmentMenuOpen ? 'bg-[var(--primary)] text-white rotate-45' : 'hover:bg-[var(--primary)]/10 text-[var(--text-secondary)] hover:text-[var(--primary)]'}`}
                                            title="Attachments"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </button>

                                        {/* Attachment Dropdown */}
                                        {attachmentMenuOpen && (
                                            <div className="absolute bottom-full mb-2 left-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-2 duration-200 z-20">
                                                <div className="p-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAttachmentMenuOpen(false);
                                                            handleFileClick();
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                                                    >
                                                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                                            <Paperclip className="h-4 w-4" />
                                                        </div>
                                                        <span>Document</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAttachmentMenuOpen(false);
                                                            handleFileClick(); // Re-using file handler for now, ideally separate image handler
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                                                    >
                                                        <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                                                            <ImageIcon className="h-4 w-4" />
                                                        </div>
                                                        <span>Photos & Videos</span>
                                                    </button>

                                                    <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAttachmentMenuOpen(false);
                                                            setShowCalendar(true);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                                                    >
                                                        <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                                                            <Calendar className="h-4 w-4" />
                                                        </div>
                                                        <span>Festival Cal.</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAttachmentMenuOpen(false);
                                                            onOpenExpenseModal?.();
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                                                    >
                                                        <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                                                            <CreditCard className="h-4 w-4" />
                                                        </div>
                                                        <span>Expense</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Voice Input Button */}
                                    <button
                                        type="button"
                                        onClick={toggleDictation}
                                        disabled={isUploading}
                                        className={`p-2.5 rounded-xl transition-all duration-200 active:scale-90 ${isListening
                                            ? "bg-amber-500/10 text-amber-500 animate-pulse ring-2 ring-amber-500/20"
                                            : "hover:bg-amber-500/10 text-slate-400 hover:text-amber-500"
                                            }`}
                                        title={isListening ? "Stop Listening" : "Voice to Text"}
                                    >
                                        {isListening ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Mic className="h-5 w-5" />
                                        )}
                                    </button>

                                    {/* Festival Smart Button */}
                                    {activeFestival && (activeFestival.status === "active" || activeFestival.status === "upcoming") && (
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setFestivalMenuOpen(!festivalMenuOpen)}
                                                disabled={isUploading}
                                                className={`p-2.5 rounded-xl transition-all duration-300 active:scale-90 relative overflow-hidden group/fest
                                                    ${activeFestival.status === "active"
                                                        ? (festivalMenuOpen
                                                            ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                                                            : 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20')
                                                        : (festivalMenuOpen
                                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                                            : 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20')
                                                    }`}
                                                title={`${activeFestival.name} Actions`}
                                            >
                                                {/* Glowing Effect */}
                                                {(activeFestival.status === "active" || activeFestival.days_until <= 3) && (
                                                    <div className={`absolute inset-0 blur-md opacity-0 group-hover/fest:opacity-100 transition-opacity duration-500 animate-pulse ${activeFestival.status === "active"
                                                        ? "bg-pink-400/30"
                                                        : "bg-indigo-400/30"
                                                        }`} />
                                                )}

                                                {activeFestival.status === "active" ? (
                                                    <Sparkles className="h-5 w-5 relative z-10" />
                                                ) : (
                                                    <Loader2 className="h-5 w-5 relative z-10" />
                                                )}

                                                {/* Active Badge */}
                                                {activeFestival.status === "active" && (
                                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500" />
                                                    </span>
                                                )}
                                            </button>

                                            {/* Festival Dropdown Menu */}
                                            {festivalMenuOpen && (
                                                <FestivalDropdown
                                                    festival={activeFestival}
                                                    onClose={() => setFestivalMenuOpen(false)}
                                                    onInsertGreeting={(text) => {
                                                        setMessage(text);
                                                        setFestivalMenuOpen(false);
                                                    }}
                                                    onOpenContributions={() => {
                                                        onOpenContributions();
                                                        setFestivalMenuOpen(false);
                                                    }}
                                                    isGroup={isGroup}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Send Button */}
                                    <button
                                        type="submit"
                                        disabled={(!message.trim() && !previewFile) || isUploading}
                                        className={`p-3 rounded-xl transition-all duration-300 active:scale-95 ${(message.trim() || previewFile) && !isUploading
                                            ? "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-lg shadow-[var(--primary)]/20 hover:shadow-[var(--primary)]/40 hover:-translate-y-0.5"
                                            : "bg-[var(--surface-hover)] text-[var(--text-tertiary)] cursor-not-allowed opacity-50"
                                            }`}
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Hint */}
                    {!isReadOnly && (
                        <div className="mt-2.5 px-2 flex justify-between items-center opacity-60">
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-tertiary)]">
                                {isUploading ? "Processing..." : "Secure End-to-End Encryption"}
                            </p>
                            <div className="flex gap-3">
                                <span className="text-[10px] font-medium text-[var(--text-tertiary)]">
                                    Drag files to upload
                                </span>
                            </div>
                        </div>
                    )}
                </form>
            </div >

            {/* Indian Calendar Component */}
            < IndianCalendar
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onSelectGreeting={handleInsertGreeting}
                onGenerate={handleGreetingsGenerated}
            />

            {/* Create Expense Modal - Hoisted to ChatRoom */}
        </div >
    );
};

// Festival Dropdown Component
const FestivalDropdown = ({ festival, onClose, onInsertGreeting, onOpenContributions, isGroup }) => {
    const [view, setView] = useState("menu");
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Generate AI Greetings
    const handleGenerate = async () => {
        setIsLoading(true);
        setView("loading");

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://127.0.0.1:8000/api/festival/greeting/",
                {
                    festival_id: festival.festival_id,
                    festival_name: festival.name,
                    tone: "Happy"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuggestions(response.data.messages || []);
                setView("suggestions");
            } else {
                throw new Error(response.data.error || "Failed to generate");
            }
        } catch (error) {
            console.error("Generation error:", error);
            setSuggestions(["⚠️ Failed to generate greetings. Please try again."]);
            setView("suggestions");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute bottom-full right-0 mb-3 w-64 bg-[var(--surface-light)] border border-[var(--border-light)] rounded-xl shadow-2xl overflow-hidden z-20 animate-in slide-in-from-bottom-2 zoom-in-95 duration-200 flex flex-col">
            {/* Header */}
            <div className={`px-4 py-3 text-white flex justify-between items-center ${festival.status === 'active'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                        {festival.status === 'active' ? '🎉 Happening Now' : `⏳ In ${festival.days_until} Days`}
                    </p>
                    <p className="font-bold text-sm">{festival.name}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>

            {/* Content Body */}
            <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {/* Main Menu */}
                {view === "menu" && (
                    <div className="space-y-1">
                        <button
                            onClick={handleGenerate}
                            className="w-full text-left px-3 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-lg flex items-center gap-3 transition-colors group"
                        >
                            <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-full text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <span className="font-medium block">Generate Greeting</span>
                                <span className="text-[10px] text-[var(--text-tertiary)]">
                                    Gemini AI Magic ✨
                                </span>
                            </div>
                        </button>

                        {isGroup && festival.status === 'active' && (
                            <button
                                onClick={onOpenContributions}
                                className="w-full text-left px-3 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-lg flex items-center gap-3 transition-colors group"
                            >
                                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <span className="text-sm font-bold">$</span>
                                </div>
                                <div className="flex-1">
                                    <span className="font-medium block">Contributions</span>
                                    <span className="text-[10px] text-[var(--text-tertiary)]">
                                        Manage group funds
                                    </span>
                                </div>
                            </button>
                        )}

                        <div className="mt-2 pt-2 border-t border-[var(--border-light)] px-3 text-xs text-[var(--text-tertiary)]">
                            <p className="line-clamp-2 italic opacity-80">
                                "Gemini AI generates unique wishes for {festival.name}!"
                            </p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {view === "loading" && (
                    <div className="flex flex-col items-center justify-center py-8 text-[var(--text-secondary)]">
                        <Loader2 className="h-8 w-8 animate-spin text-pink-500 mb-2" />
                        <span className="text-xs font-medium">Gemini AI is crafting magic...</span>
                    </div>
                )}

                {/* Suggestions */}
                {view === "suggestions" && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1 mb-2">
                            <button
                                onClick={() => setView("menu")}
                                className="text-xs text-[var(--text-tertiary)] hover:text-[var(--primary)] hover:underline"
                            >
                                Back
                            </button>
                            <span className="text-[var(--border-light)]">|</span>
                            <span className="text-xs font-semibold text-[var(--text-secondary)]">
                                Click to Insert
                            </span>
                        </div>
                        {suggestions.map((text, i) => (
                            <button
                                key={i}
                                onClick={() => onInsertGreeting(text)}
                                className="w-full text-left p-2.5 text-xs text-[var(--text-secondary)] bg-[var(--surface-hover)]/50 hover:bg-[var(--surface-hover)] border border-transparent hover:border-pink-300 rounded-lg transition-all"
                            >
                                "{text}"
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInput;