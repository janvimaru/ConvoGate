import axios from "axios";
import { API_BASE } from "./constants";


const API_BASE_URL = API_BASE;

const API = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});


//    REQUEST INTERCEPTOR

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);


//    RESPONSE INTERCEPTOR

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refresh_token");
            if (!refreshToken) {
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(
                    `${API_BASE}/token/refresh/`,
                    { refresh: refreshToken }
                );

                localStorage.setItem("token", res.data.access);
                originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                return API(originalRequest);
            } catch {
                localStorage.clear();
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

/* =========================
   SIDEBAR
========================= */
export const fetchSidebarAPI = () => API.get("/sidebar/");

/* =========================
   ROOMS
========================= */
export const createRoomAPI = (data) => API.post("/room/create/", data);
export const joinRoomAPI = (pin) => API.post("/room/join/", { pin });
export const saveQuickChatAPI = (roomId) => API.post("/room/save-quick-chat/", { roomId });


export const getRoomDetailsAPI = (room_id) =>
    API.get(`/room/${room_id}/`);

export const fetchGroupInfoAPI = (roomId) =>
    API.get(`/room/${roomId}/info/`);

// ✅ Phase 5: Search & Discovery
export const searchMessagesAPI = (roomId, query, type) => {
    let url = `/room/${roomId}/search/`;
    if (query || type) {
        const params = new URLSearchParams();
        if (query) params.append("q", query);
        if (type) params.append("type", type);
        url += `?${params.toString()}`;
    }
    return API.get(url);
};

export const globalSearchAPI = (query) =>
    API.get(`/search/global/?q=${encodeURIComponent(query)}`);

/* =========================
   DASHBOARD
========================= */
export const fetchDashboardAPI = () => API.get("/dashboard/");

export const manageStarredAPI = (messageId, action) =>
    API.post("/messages/star/", { message_id: messageId, action });

export const translateMessageAPI = (messageId, targetLang) =>
    API.post("/messages/translate/", { message_id: messageId, target_lang: targetLang });


/* =========================
   USERS
========================= */
export const fetchAllUsersAPI = (query = "") =>
    API.post("/users/search/", { query });

export const getCurrentUserAPI = () => API.get("/profile/");
export const updateProfileAPI = (data) => API.post("/profile/", data);

// Add signupAPI object for compatibility with old ProfileSettings.jsx
export const signupAPI = {
    getCurrentUser: getCurrentUserAPI,
    updateProfile: updateProfileAPI,
    changePassword: (data) => API.post("/auth/change-password/", data),
    uploadProfilePicture: (formData) => API.post("/upload/profile-pic/", formData, {
        headers: {
            "Content-Type": undefined,
        }
    }),
};

/* =========================
   MESSAGES
========================= */
export const sendMessageAPI = (payload) =>
    API.post("/messages/", { action: "send", ...payload });

export const getMessageHistoryAPI = (room_id) =>
    API.get(`/room/${room_id}/messages/`);


/* =========================
   NOTIFICATIONS
========================= */
export const notificationAPI = {
    getNotifications: () => API.get("/notifications/"),
    getUnreadCount: () => API.get("/notifications/unread/"),
    markAsRead: (id) => API.post("/notifications/mark_read/", { id }),
    markAllAsRead: () => API.post("/notifications/mark_all_read/"),
};

/* =========================
   ADMIN JOIN ACTION  ✅ FIXED
========================= */
export const adminJoinActionAPI = (room_id, user_id, action) => {
    return API.post("/room/join-action/", {
        room_id,
        user_id,
        action, // "approve" | "reject"
    });
};

export const removeMemberAPI = (room_id, user_id) => {
    return API.post("/room/member/", {
        room_id,
        user_id,
        action: "remove_member"
    });
};

/* =========================
   FESTIVALS
========================= */
export const getActiveFestivalAPI = () => API.get("/api/festival/dashboard/");
export const generateGreetingAPI = (festival_id, tone) => API.post("/api/festival/greeting/", { festival_id, tone });
export const manageContributionAPI = (festival_id, amount, group_id) => API.post("/api/festival/contribution/", { festival_id, amount, group_id });
export const generateCardDesignsAPI = (festival_name) => API.post("/api/festival/card-design/", { festival_name });

export const uploadRoomAvatarAPI = (formData) => API.post("/upload/room-avatar/", formData, {
    headers: { "Content-Type": "multipart/form-data" }
});



/* =========================
   EXPENSES
========================= */
export const createExpenseAPI = (data) => API.post("/api/expenses/create/", data);
export const expenseActionAPI = (data) => API.post("/api/expenses/action/", data); // { action, payment_id, method? }
export const getExpenseDetailsAPI = (expenseId) => API.get(`/api/expenses/${expenseId}/`);

export default API;
