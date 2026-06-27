import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import ChatHeader from "../Components/Chat/ChatHeader";
import MessageBubble from "../Components/Chat/MessageBubble";
import ChatInput from "../Components/Chat/ChatInput";
import GroupInfoPanel from "../Components/Chat/GroupInfoPanel";
import ReactionListModal from "../Components/Chat/ReactionListModal";
import FullScreenMedia from "../Components/Chat/FullScreenMedia";
import KeepChatModal from "../Components/Chat/KeepChatModal";
import useWebSocket from "../Hooks/useWebSocket";
import { FileText, Zap, Clock, Save } from "lucide-react";
import {
  getRoomDetailsAPI,
  getMessageHistoryAPI,
  fetchGroupInfoAPI,
  searchMessagesAPI,
  manageStarredAPI,
  saveQuickChatAPI
} from "../Utils/api";
// FESTIVAL COMPONENTS
// FESTIVAL COMPONENTS
import CreateExpenseModal from "../Components/Chat/CreateExpenseModal";
import ContributionTracker from "../Components/Festival/ContributionTracker";
import Toast from "../Components/UI/Toast";

const ChatRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();

  // Helper function for consistent timestamp formatting (24-hour format)
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month}, ${hours}:${minutes}`;
  };

  // Optimistic initial state from navigation
  const initialRoom = location.state?.room || null;

  const [room, setRoom] = useState(initialRoom);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(!initialRoom); // Only full load if no initial data
  const [messagesLoading, setMessagesLoading] = useState(true); // Separate loading for messages
  const [typingUser, setTypingUser] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [groupInfo, setGroupInfo] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null); // { url, type }
  const [viewingReactions, setViewingReactions] = useState(null); // { reactions: [] }
  const [showKeepChatModal, setShowKeepChatModal] = useState(false);

  // FESTIVAL STATE
  // FESTIVAL STATE
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [toast, setToast] = useState(null);

  /* ================= DATA FETCHING ================= */
  /* ================= DATA FETCHING ================= */
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const handleViewReactions = (reactions) => {
    setViewingReactions(reactions);
  };
  const messagesEndRef = useRef(null);

  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const myUserId = user?.user_id || user?.id;
  const myUsername = user?.full_name || user?.username;

  const { isConnected, sendMessage } = useWebSocket(roomId);

  // FESTIVAL STATE
  const [activeFestival, setActiveFestival] = useState(null);
  const [showFestivalBanner, setShowFestivalBanner] = useState(true);

  /* ================= DATA FETCHING ================= */
  const fetchData = React.useCallback(async () => {
    if (!room) setLoading(true);
    setMessagesLoading(true);

    try {
      // Import api dynamically to resolve circular dependency if method used in parallel
      const apiModule = await import("../Utils/api"); // Ensure api is imported
      const api = apiModule.default;

      // Parallel fetch: Room, Messages, GroupInfo, AND Festival Dashboard
      const [roomRes, historyRes, groupRes, festivalRes] = await Promise.all([
        getRoomDetailsAPI(roomId),
        getMessageHistoryAPI(roomId),
        fetchGroupInfoAPI(roomId).catch(() => ({ data: { success: false } })),
        activeFestival ? Promise.resolve({ data: activeFestival }) : api.get("/api/festival/dashboard/").catch(() => ({ data: { found: false, status: "none" } }))
      ]);

      // Process Festival
      if (festivalRes.data) {
        // Store the full status object
        setActiveFestival(festivalRes.data);

        // REMINDER SYSTEM
        if (festivalRes.data.status === 'upcoming' && festivalRes.data.days_until <= 3) {
          const key = `notified-${roomId}-${festivalRes.data.festival_id}`;
          if (!sessionStorage.getItem(key)) {
            setToast({
              title: `🎉 ${festivalRes.data.name} is coming!`,
              message: `${festivalRes.data.name} is in ${festivalRes.data.days_until} days. Preparation time!`,
              type: 'info'
            });
            sessionStorage.setItem(key, 'true');
          }
        }
      } else {
        setActiveFestival(null);
      }

      const roomData = roomRes.data.room;
      if (roomData) {
        setRoom(roomData);
      }

      const formattedMessages = (historyRes.data.messages || []).map((m) => ({
        id: m.message_id,
        text: m.content,
        sender: m.sender_user_id,
        senderName: m.sender_name,
        sender_profile_pic: m.sender_profile_pic,
        message_type: m.message_type || "text",
        voice_url: m.voice_url,
        reactions: m.reactions || [],
        isStarred: m.is_starred === 1,
        parent_message_id: m.parent_message_id,
        parent_content: m.parent_content,
        timestamp: m.created_at ? formatTimestamp(m.created_at) : formatTimestamp(new Date()),
        status: m.status || "sent",
        isOwn: m.sender_user_id == myUserId,
      }));
      setMessages(formattedMessages);

      if (groupRes.data.success) {
        setGroupInfo(groupRes.data);
      }

      if (formattedMessages.length > 0) {
        const lastMsg = formattedMessages[formattedMessages.length - 1];
        if (!lastMsg.isOwn) {
          sendMessage({ action: "message_seen", message_id: lastMsg.id });
        }
      }

    } catch (err) {
      console.error("Data fetch failed", err);
    } finally {
      setLoading(false);
      setMessagesLoading(false);
    }
  }, [roomId, myUserId, sendMessage, room]);

  useEffect(() => {
    fetchData();
  }, [roomId]);

  /* ================= SEARCH & STAR ================= */
  const handleSearch = React.useCallback(async (query, type) => {
    if (!query && !type) {
      fetchData();
      return;
    }
    try {
      const res = await searchMessagesAPI(roomId, query, type);
      if (res.data.success) {
        const formatted = (res.data.messages || []).map((m) => ({
          id: m.message_id,
          text: m.content,
          sender: m.sender_user_id,
          senderName: m.sender_name,
          sender_profile_pic: m.sender_profile_pic,
          message_type: m.message_type || "text",
          voice_url: m.voice_url,
          reactions: m.reactions || [],
          isStarred: m.is_starred === 1,
          parent_message_id: m.parent_message_id,
          timestamp: formatTimestamp(m.created_at),
          status: m.status || "sent",
          isOwn: m.sender_user_id === myUserId,
        }));
        setMessages(formatted);
      }
    } catch (err) {
      console.error("Search failed", err);
    }
  }, [roomId, myUserId, fetchData]);

  const handleStar = async (messageId, action) => {
    try {
      await manageStarredAPI(messageId, action);
    } catch (err) {
      console.error("Starring failed", err);
    }
  };

  /* ================= REALTIME RECEIVE ================= */
  useEffect(() => {
    const chatHandler = (e) => {
      const data = e.detail;
      setMessages((prev) => {
        if (prev.some(m => m.id === data.message_id)) return prev;

        if (data.sender_user_id == myUserId) {
          const existingTempIndex = prev.findIndex(m =>
            m.isOwn &&
            m.status === "sending" &&
            m.text === data.content
          );

          if (existingTempIndex !== -1) {
            const newMessages = [...prev];
            newMessages[existingTempIndex] = {
              ...newMessages[existingTempIndex],
              id: data.message_id,
              timestamp: formatTimestamp(data.timestamp),
              status: "sent"
            };
            return newMessages;
          }
        }

        return [
          ...prev,
          {
            id: data.message_id,
            text: data.content,
            sender: data.sender_user_id,
            senderName: data.sender_name,
            sender_profile_pic: data.sender_profile_pic,
            message_type: data.message_type || "text",
            voice_url: data.voice_url,
            parent_message_id: data.parent_message_id,
            reactions: [],
            timestamp: formatTimestamp(data.timestamp),
            status: "delivered",
            isOwn: data.sender_user_id == myUserId,
          },
        ];
      });

      if (data.sender_user_id !== myUserId) {
        sendMessage({ action: "message_delivered", message_id: data.message_id });
        sendMessage({ action: "message_seen", message_id: data.message_id });
      }
    };

    const typingHandler = (e) => {
      const data = e.detail;
      if (data.user_id === myUserId) return;
      setTypingUser(data.is_typing ? data.username : null);
    };

    const reactionHandler = (e) => {
      const data = e.detail;
      setMessages((prev) =>
        prev.map((m) =>
          (m.id === data.message_id || `ws-${m.id}` === `${data.message_id}`)
            ? {
              ...m,
              reactions:
                data.action === "add"
                  ? [...(m.reactions || []), data]
                  : (m.reactions || []).filter((r) => r.user_id !== data.user_id || r.emoji !== data.emoji),
            }
            : m
        )
      );
    };

    const statusHandler = (e) => {
      const data = e.detail;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.message_id ? { ...m, status: data.status } : m
        )
      );
    };

    window.addEventListener("chat-message", chatHandler);
    window.addEventListener("user-typing", typingHandler);
    window.addEventListener("message-reaction", reactionHandler);
    window.addEventListener("message-status-update", statusHandler);

    return () => {
      window.removeEventListener("chat-message", chatHandler);
      window.removeEventListener("user-typing", typingHandler);
      window.removeEventListener("message-reaction", reactionHandler);
      window.removeEventListener("message-status-update", statusHandler);
    };
  }, [myUserId, roomId]);


  /* ================= SEND MESSAGE ================= */
  const handleSendMessage = (payload) => {
    const tempId = `local-${Date.now()}`;
    const isObject = typeof payload === "object";
    const text = isObject ? payload.content : payload;
    const message_type = isObject ? payload.message_type : "text";
    const voice_url = isObject ? payload.voice_url : null;

    const newMessage = {
      id: tempId,
      text,
      sender: myUserId,
      senderName: myUsername,
      message_type,
      voice_url,
      reactions: [],
      timestamp: formatTimestamp(new Date()),
      status: "sending",
      isOwn: true,
      sender_profile_pic: user?.profile_pic
    };

    setMessages((prev) => [...prev, newMessage]);

    sendMessage({
      action: "send_message",
      content: text,
      message_type,
      voice_url,
      sender_user_id: myUserId,
      parent_message_id: replyTo?.id
    });

    setReplyTo(null);
  };

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesLoading]);

  const handleMediaClick = (url, type) => {
    setSelectedMedia({ url, type });
  };


  // Quick Chat Expiry Logic
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!room?.expiryTime || !room?.isQuickChat) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(room.expiryTime);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expired (Read-Only)");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room]);

  const handleSaveChat = async () => {
    try {
      const res = await saveQuickChatAPI(roomId);
      if (res.data.success) {
        setRoom(prev => ({
          ...prev,
          isSaved: res.data.is_saved,
          isReadOnly: res.data.is_read_only,
          isActive: res.data.is_active
        }));
        setShowKeepChatModal(false);
      }
    } catch (err) {
      console.error("Failed to save chat", err);
      alert("Failed to save chat. Please try again.");
    }
  };

  const onKeepChatClick = () => {
    setShowKeepChatModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
          <p className="text-[var(--text-muted)] font-medium">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Reaction List Modal */}
      {viewingReactions && (
        <ReactionListModal
          reactions={viewingReactions}
          onClose={() => setViewingReactions(null)}
        />
      )}

      {/* Fullscreen Media Modal */}
      {selectedMedia && (
        <FullScreenMedia
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}

      {/* Keep Chat Confirmation Modal */}
      <KeepChatModal
        isOpen={showKeepChatModal}
        onClose={() => setShowKeepChatModal(false)}
        onConfirm={handleSaveChat}
      />

      {/* TOAST NOTIFICATIONS */}
      {toast && <Toast notification={toast} onClose={() => setToast(null)} />}

      <ContributionTracker
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        groupId={roomId}
      />

      {/* Quick Chat Banner */}
      {(room?.isQuickChat || room?.isSaved) && (
        <div className={`px-4 py-3 text-white flex items-center justify-between shadow-md z-10 shrink-0 ${room.isSaved ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-gradient-to-r from-purple-600 to-indigo-600"}`}>
          <div className="flex items-center gap-2">
            <Zap className={`w-5 h-5 ${room.isSaved ? "text-white" : "text-yellow-300 animate-pulse"}`} />
            <span className="font-medium text-sm">
              {room.isSaved ? (
                <>Saved Chat: Becomes <span className="font-bold underline">Read-Only</span> in <span className="font-mono ml-1">{timeLeft}</span></>
              ) : (
                <>Quick Chat: Expires in <span className="font-bold font-mono ml-1">{timeLeft}</span></>
              )}
            </span>
          </div>
          {room?.adminUserId == myUserId && !room.isSaved && (
            <button
              onClick={onKeepChatClick}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 active:bg-white/40 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border border-white/20 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Keep Chat</span>
            </button>
          )}
          {room.isSaved && (
            <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg text-sm font-medium border border-white/20">
              <Save className="w-4 h-4" />
              Saved
            </span>
          )}
        </div>
      )}

      {room && (
        <ChatHeader
          roomName={room.name}
          roomAvatar={room.roomAvatar}
          memberCount={room.memberCount}
          isPrivate={room.isPrivate}
          lastSeen={room.lastSeen}
          typingUser={typingUser}
          statusMessage={room.status_message}
          onInfoToggle={() => setIsInfoOpen(!isInfoOpen)}
          onSearch={handleSearch}
          showSaveButton={room.isQuickChat && room.adminUserId == myUserId}
          isSaved={room.isSaved}
          onSave={onKeepChatClick}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">



          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">

            {/* SKELETON LOADER FOR MESSAGES */}
            {messagesLoading && messages.length === 0 && (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <div className={`h-12 rounded-2xl w-1/3 ${i % 2 === 0 ? 'bg-[var(--primary)]/20' : 'bg-[var(--surface)]'}`}></div>
                  </div>
                ))}
              </div>
            )}

            {!messagesLoading && messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-tertiary)] min-h-[400px]">
                <div className="w-20 h-20 bg-[var(--surface)] rounded-full flex items-center justify-center mb-6 shadow-sm opacity-50">
                  <FileText className="w-10 h-10" />
                </div>
                <p className="text-xl font-semibold opacity-60">No messages yet</p>
                <p className="text-sm opacity-40 mt-1">Start the conversation with a friendly hello!</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <MessageBubble
                key={msg.id}
                message={{
                  ...msg,
                  reactions: (msg.reactions || []).map(r => ({ ...r, isOwn: r.user_id === myUserId }))
                }}
                isOwn={msg.isOwn}
                timestamp={msg.timestamp}
                status={msg.status}
                showAvatar={index === 0 || messages[index - 1]?.sender !== msg.sender}
                onMediaClick={handleMediaClick}
                onViewReactions={handleViewReactions}
                onReaction={(msgId, emoji, reactionAction) => {
                  sendMessage({
                    action: "reaction",
                    message_id: msgId,
                    emoji,
                    reaction_action: reactionAction
                  });

                  setMessages(prev => prev.map(m => {
                    if (m.id === msgId) {
                      const current = m.reactions || [];
                      if (reactionAction === "add") {
                        return {
                          ...m,
                          reactions: [...current, {
                            user_id: myUserId,
                            username: myUsername,
                            emoji,
                            profile_pic: user?.profile_pic
                          }]
                        };
                      } else {
                        return { ...m, reactions: current.filter(r => !(r.user_id === myUserId && r.emoji === emoji)) };
                      }
                    }
                    return m;
                  }));
                }}
                onReply={() => setReplyTo(msg)}
                onStar={handleStar}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            key={roomId}
            onSendMessage={handleSendMessage}
            onTyping={(isTyping) => sendMessage({ action: "typing", is_typing: isTyping })}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            isReadOnly={room?.isReadOnly}
            activeFestival={activeFestival}
            onOpenContributions={() => setShowContributionModal(true)}
            isGroup={room?.isGroup}
            roomId={roomId}
            onOpenExpenseModal={() => setShowExpenseModal(true)}
            roomName={room?.name}
          />
        </div>

        {/* Create Expense Modal - Hoisted for Stacking Context */}
        <CreateExpenseModal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          roomId={roomId}
          members={groupInfo?.members || []}
        />

        <GroupInfoPanel
          isOpen={isInfoOpen}
          onClose={() => setIsInfoOpen(false)}
          group={room}
          members={groupInfo?.members || []}
        />
      </div>
    </div>
  );
};

export default ChatRoom;
