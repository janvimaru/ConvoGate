
import React, { useState } from "react";
import { Check, CheckCheck, Clock, Smile, Reply, Star, Languages, Music, FileText, Loader2 } from "lucide-react";
import { translateMessageAPI } from "../../Utils/api";
import FestivalCard from "./FestivalCard";
import ExpenseCard from "./ExpenseCard";
import { getShadeGradient } from "../../Utils/colorUtils";
import { API_BASE } from "../../Utils/constants";



const MessageBubble = ({ message, isOwn, timestamp, status, showAvatar, onReaction, onReply, onStar, onMediaClick, onViewReactions, isGroup }) => {
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    
    // Quick helper to detect expense payloads mistakenly sent as 'text'
    const isExpensePayload = (msgText) => {
        try {
            if (typeof msgText !== 'string' || !msgText.includes('"expense_id"')) return false;
            const parsed = JSON.parse(msgText);
            return !!(parsed && parsed.expense_id);
        } catch (e) {
            return false;
        }
    };
    
    const isSpecialType = ["image", "video", "file", "document", "expense", "festival_card"].includes(message.message_type) || isExpensePayload(message.text);
    const isExpenseMessage = message.message_type === "expense" || isExpensePayload(message.text);
    
    const [isStarred, setIsStarred] = useState(message.isStarred || message.is_starred || false);
    const [translatedText, setTranslatedText] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showLangPicker, setShowLangPicker] = useState(false);

    const getStatusIcon = () => {
        if (status === "sending") return <Clock className="w-3 h-3 animate-pulse" />;
        if (status === "sent") return <Check className="w-3 h-3" />;
        if (status === "delivered") return <CheckCheck className="w-3 h-3 text-slate-400" />;
        if (status === "seen") return <CheckCheck className="w-3 h-3 text-blue-500" />; // ✅ Blue ticks
        return null;
    };

    const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

    const handleReactionClick = (emoji) => {
        if (onReaction) {
            const hasReacted = message.reactions?.find(r => r.emoji === emoji && r.isOwn);
            onReaction(message.id, emoji, hasReacted ? "remove" : "add");
        }
        setShowReactionPicker(false);
    };


    const handleStarClick = () => {
        const newStatus = !isStarred;
        setIsStarred(newStatus);
        if (onStar) {
            onStar(message.id || message.message_id, newStatus ? "star" : "unstar");
        }
    };

    const handleTranslate = async (lang) => {
        setIsTranslating(true);
        setShowLangPicker(false);
        try {
            const res = await translateMessageAPI(message.id || message.message_id, lang);
            if (res.data.success) {
                setTranslatedText(res.data.translated_content);
            }
        } catch (err) {
            console.error("Translation failed", err);
        } finally {
            setIsTranslating(false);
        }
    };

    // Group reactions by emoji
    const reactionGroups = (message.reactions || []).reduce((acc, curr) => {
        acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className={`group flex ${isOwn ? "justify-end" : "justify-start"} animate-message mb-1 relative items-center`}>
            {/* Actions (Left side for Own messages) - FLEX LAYOUT */}
            {isOwn && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1 mr-2 order-1">
                    {!message.voice_url && message.message_type === "text" && (
                        <button
                            onClick={() => setShowLangPicker(!showLangPicker)}
                            className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${showLangPicker ? "text-indigo-500" : "text-slate-400"}`}
                            title="Translate"
                        >
                            <Languages className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={() => onReply && onReply(message)}
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Reply"
                    >
                        <Reply className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setShowReactionPicker(!showReactionPicker)}
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                        title="React"
                    >
                        <Smile className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleStarClick}
                        className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${isStarred ? "text-yellow-500" : "text-slate-400"}`}
                        title={isStarred ? "Unstar" : "Star"}
                    >
                        <Star className={`h-4 w-4 ${isStarred ? "fill-yellow-500" : ""}`} />
                    </button>

                    {/* Pickers (Absolute relative to button or container) */}
                    <div className="relative">
                        {showLangPicker && (
                            <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-xl p-2 flex flex-col space-y-1 z-50 animate-in fade-in zoom-in duration-200 min-w-[100px]">
                                <button onClick={() => handleTranslate('hi')} className="text-[10px] font-bold py-1 px-2 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">Hindi</button>
                                <button onClick={() => handleTranslate('gu')} className="text-[10px] font-bold py-1 px-2 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">Gujarati</button>
                            </div>
                        )}
                        {showReactionPicker && (
                            <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-full p-1 flex space-x-1 z-50 animate-in fade-in zoom-in duration-200 w-max">
                                {commonEmojis.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleReactionClick(emoji)}
                                        className="hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-full text-lg hover:scale-125 transition-transform"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Avatar (only first message in group AND NOT OWN) */}
            {!isOwn && showAvatar && (
                <div className="flex-shrink-0 mb-1 self-end mr-3 order-1">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-white/10"
                        style={{ background: getShadeGradient(message.sender_id || message.senderName) }}
                    >
                        {message.sender_profile_pic ? (
                            <img
                                src={`${API_BASE}/media/${message.sender_profile_pic}`}
                                alt={message.senderName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-sm font-bold text-white uppercase">
                                {message.senderName?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Spacer for grouping if no avatar to maintain alignment (only for others) */}
            {!isOwn && !showAvatar && (
                <div className="flex-shrink-0 w-9 mb-1 self-end mr-3 order-1" style={{ height: '36px' }} />
            )}


            {/* Message Content */}
            <div className={`relative ${isOwn ? 'order-3' : 'order-2'}`}>
                <div
                    className={`max-w-[100%] rounded-2xl flex flex-col transition-all duration-300 ${isSpecialType
                        ? "p-0 bg-transparent border-none shadow-none"
                        : `px-4 py-2.5 shadow-sm ${isOwn
                            ? "text-white rounded-tr-none"
                            : "bg-[var(--message-received-bg)] text-[var(--message-received-text)] rounded-tl-none border border-[var(--border-light)]"
                        }`
                        }`
                    }
                    style={{
                        backgroundImage: isOwn && !isSpecialType ? 'var(--gradient-primary)' : 'none',
                        minWidth: isSpecialType ? 'auto' : '80px',
                        maxWidth: '480px'
                    }}
                >
                    {/* Username (ONLY once per group and NOT for own messages) */}
                    {!isOwn && showAvatar && (
                        <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-1 tracking-tight">
                            {message.senderName}
                        </span>
                    )}

                    {/* ✅ Parent Message Preview (Reply) */}
                    {message.parent_message_id && (
                        <div className={`mb-2 p-2 rounded-xl border-l-4 text-xs ${isOwn
                            ? "bg-white/10 border-white/30 text-indigo-50"
                            : "bg-slate-100 dark:bg-slate-700/50 border-indigo-500 text-slate-500 dark:text-slate-400"
                            } italic truncate`}>
                            {message.parent_content || "Original message"}
                        </div>
                    )}

                    {/* Message content */}
                    <div className="relative">
                        {message.message_type === "image" && message.voice_url ? (
                            <div className="relative rounded-2xl overflow-hidden shadow-md bg-slate-100 dark:bg-slate-700 min-h-[100px] min-w-[200px]">
                                <img
                                    src={message.voice_url}
                                    alt="Shared media"
                                    className="max-w-full max-h-[500px] object-contain hover:scale-105 transition-transform duration-500 cursor-pointer"
                                    onClick={() => onMediaClick && onMediaClick(message.voice_url, 'image')}
                                />
                            </div>
                        ) : message.message_type === "video" && message.voice_url ? (
                            <div className="relative rounded-xl overflow-hidden my-1 bg-black aspect-video max-w-full group/video">
                                <video
                                    src={message.voice_url}
                                    className="w-full h-full cursor-pointer"
                                    onClick={() => onMediaClick && onMediaClick(message.voice_url, 'video')}
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/video:opacity-100 transition-opacity">
                                    <div className="bg-black/50 p-4 rounded-full">
                                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                                    </div>
                                </div>
                            </div>
                        ) : message.message_type === "voice" && message.voice_url ? (
                            <div className={`flex items-center gap-4 p-3 rounded-2xl my-1 ${isOwn ? 'bg-white/10' : 'bg-indigo-50 dark:bg-slate-700'}`}>
                                <button className={`p-3 rounded-full ${isOwn ? 'bg-white text-indigo-600' : 'bg-indigo-500 text-white shadow-md shadow-indigo-200'}`}>
                                    <div className="w-5 h-5 flex items-center justify-center">
                                        <Music className="w-4 h-4" />
                                    </div>
                                </button>
                                <div className="flex-1 min-w-0">
                                    <audio src={message.voice_url} controls className="w-full h-10 opacity-80" />
                                </div>
                            </div>
                        ) : (message.message_type === "file" || message.message_type === "document") && message.voice_url ? (
                            <div className={`flex items-center gap-4 p-4 rounded-2xl my-1 border ${isOwn ? 'bg-white/10 border-white/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                                <div className={`p-3 rounded-xl ${isOwn ? 'bg-white text-indigo-600' : 'bg-indigo-500 text-white shadow-sm'}`}>
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${isOwn ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{message.text || "Shared File"}</p>
                                    <button
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            try {
                                                const response = await fetch(message.voice_url);
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.style.display = 'none';
                                                a.href = url;
                                                const filename = message.voice_url.split('/').pop() || message.text || 'download';
                                                a.download = filename;
                                                document.body.appendChild(a);
                                                a.click();
                                                window.URL.revokeObjectURL(url);
                                                document.body.removeChild(a);
                                            } catch (error) {
                                                console.error('Download failed:', error);
                                                window.open(message.voice_url, '_blank');
                                            }
                                        }}
                                        className={`text-[11px] font-bold uppercase tracking-widest ${isOwn ? 'text-indigo-100 hover:text-white' : 'text-indigo-500 hover:text-indigo-600'} hover:underline mt-1 block`}
                                    >
                                        Download File
                                    </button>
                                </div>
                            </div>
                        ) : isExpenseMessage ? (
                            <div className="max-w-sm border-2 border-indigo-500/30 dark:border-indigo-400/20 rounded-[22px] p-1 shadow-lg shadow-indigo-500/5 transition-all hover:border-indigo-500/50">
                                <React.Suspense fallback={<div className="p-4 text-xs flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Loading Card...</div>}>
                                    {(() => {
                                        try {
                                            const expenseData = typeof message.text === 'string' ? JSON.parse(message.text) : message.text;
                                            if (!expenseData.expense_id && !message.content?.expense_id) return <p className="text-sm p-4">{message.text}</p>;
                                            const eId = expenseData.expense_id || message.content?.expense_id;
                                            return <ExpenseCard expenseId={eId} isOwnMessage={isOwn} />;
                                        } catch (e) {
                                            return <p className="text-sm text-red-400 p-4">Invalid Expense Data</p>;
                                        }
                                    })()}
                                </React.Suspense>
                            </div>
                        ) : message.message_type === "festival_card" ? (
                            <div className="max-w-[320px]">
                                {/* Try to parse JSON content */}
                                {(() => {
                                    try {
                                        const cardData = typeof message.text === 'string' ? JSON.parse(message.text) : message.text;
                                        return (
                                            <div className="rounded-2xl overflow-hidden shadow-xl border border-[var(--border-light)]">
                                                <FestivalCard
                                                    card={cardData}
                                                    onClick={(imgUrl) => onMediaClick && onMediaClick(imgUrl)}
                                                />
                                            </div>
                                        );
                                    } catch (e) {
                                        return <p className="text-sm text-red-400">Error loading card</p>;
                                    }
                                })()}
                            </div>
                        ) : (
                            <div>
                                <p className="break-words text-sm leading-relaxed pr-2">{message.text}</p>
                                {translatedText && (
                                    <div className={`mt-2 pt-2 border-t ${isOwn ? 'border-white/20' : 'border-slate-100 dark:border-slate-700'}`}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Languages className="h-3 w-3 opacity-60" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Translated</span>
                                        </div>
                                        <p className="break-words text-sm leading-relaxed pr-2 italic opacity-90">{translatedText}</p>
                                    </div>
                                )}
                                {isTranslating && <div className="mt-1 flex items-center gap-1.5 text-xs italic opacity-60"><Loader2 className="h-3 w-3 animate-spin" /> Translating...</div>}
                            </div>
                        )}
                    </div>

                    {/* Timestamp + status (conditionally styled for special types) */}
                    <div className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${isSpecialType
                        ? 'bg-black/30 backdrop-blur-md text-white px-2 py-1 rounded-full absolute bottom-2 right-2 z-10 font-bold'
                        : (isOwn ? 'text-indigo-100/80' : 'text-slate-400 font-semibold')
                        }`}>
                        <span>{timestamp}</span>
                        {isOwn && <div className="flex items-center ml-0.5 scale-100">{getStatusIcon()}</div>}
                    </div>
                </div>

                {/* Reactions Display */}
                {Object.keys(reactionGroups).length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                        {Object.entries(reactionGroups).map(([emoji, count]) => (
                            <button
                                key={emoji}
                                onClick={() => onViewReactions ? onViewReactions(message.reactions) : handleReactionClick(emoji)}
                                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-xs border transition-all duration-200 ${message.reactions.find(r => r.emoji === emoji && r.isOwn)
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-700"
                                    : "bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-900/50 dark:border-slate-800"
                                    } hover:scale-105 active:scale-95`}
                            >
                                <span>{emoji}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions (Right side for Other messages) - FLEX LAYOUT */}
            {
                !isOwn && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1 ml-2 order-3">
                        <button
                            onClick={handleStarClick}
                            className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${isStarred ? "text-yellow-500" : "text-slate-400"}`}
                            title={isStarred ? "Unstar" : "Star"}
                        >
                            <Star className={`h-4 w-4 ${isStarred ? "fill-yellow-500" : ""}`} />
                        </button>
                        <button
                            onClick={() => setShowReactionPicker(!showReactionPicker)}
                            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                            title="React"
                        >
                            <Smile className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onReply && onReply(message)}
                            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Reply"
                        >
                            <Reply className="h-4 w-4" />
                        </button>
                        {!message.voice_url && message.message_type === "text" && (
                            <button
                                onClick={() => setShowLangPicker(!showLangPicker)}
                                className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${showLangPicker ? "text-indigo-500" : "text-slate-400"}`}
                                title="Translate"
                            >
                                <Languages className="h-4 w-4" />
                            </button>
                        )}

                        {/* Pickers (Absolute relative to button or container) */}
                        <div className="relative">
                            {showLangPicker && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-xl p-2 flex flex-col space-y-1 z-50 animate-in fade-in zoom-in duration-200 min-w-[100px]">
                                    <button onClick={() => handleTranslate('hi')} className="text-[10px] font-bold py-1 px-2 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">Hindi</button>
                                    <button onClick={() => handleTranslate('gu')} className="text-[10px] font-bold py-1 px-2 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">Gujarati</button>
                                </div>
                            )}
                            {showReactionPicker && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-full p-1 flex space-x-1 z-50 animate-in fade-in zoom-in duration-200 w-max">
                                    {commonEmojis.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReactionClick(emoji)}
                                            className="hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-full text-lg hover:scale-125 transition-transform"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default MessageBubble;
