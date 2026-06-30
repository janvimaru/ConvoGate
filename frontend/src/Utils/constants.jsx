export const API_BASE =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const WS_BASE =
    import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8000";

export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
};

export const MESSAGE_STATUS = {
    SENDING: 'sending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    ERROR: 'error',
};

export const NOTIFICATION_TYPES = {
    MESSAGE: 'message',
    JOIN_REQUEST: 'join_request',
    INVITE: 'invite',
    SYSTEM: 'system',
    ERROR: 'error',
};

export const ROOM_TYPES = {
    PUBLIC: 'public',
    PRIVATE: 'private',
    PROTECTED: 'protected',
};

export const SOCKET_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    MESSAGE: 'message',
    JOIN_ROOM: 'join_room',
    LEAVE_ROOM: 'leave_room',
    TYPING: 'typing',
    ONLINE: 'online',
    OFFLINE: 'offline',
    NOTIFICATION: 'notification',
    USER_JOINED: 'user_joined',  // Added
    USER_LEFT: 'user_left',      // Added
};

// Alias for backward compatibility with your hook
export const WS_EVENTS = SOCKET_EVENTS;

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please login to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'Resource not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    INVALID_OTP: 'Invalid OTP. Please try again.',
    ROOM_FULL: 'Room is at maximum capacity.',
    ROOM_EXISTS: 'Room with this name already exists.',
};

export const SUCCESS_MESSAGES = {
    ROOM_CREATED: 'Room created successfully!',
    ROOM_JOINED: 'Successfully joined the room!',
    MESSAGE_SENT: 'Message sent!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    SETTINGS_UPDATED: 'Settings updated successfully!',
    NOTIFICATION_CLEARED: 'Notifications cleared!',
};

export const VALIDATION = {
    ROOM_NAME_MIN: 3,
    ROOM_NAME_MAX: 50,
    USERNAME_MIN: 3,
    USERNAME_MAX: 30,
    MESSAGE_MAX: 2000,
    OTP_LENGTH: 6,
    MAX_MEMBERS: 100,
};

export const STORAGE_KEYS = {
    THEME: 'theme',
    USER: 'user',
    TOKEN: 'token',
    NOTIFICATIONS: 'convoGateNotifications',
    RECENT_ROOMS: 'recentRooms',
};

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
    },
    ROOMS: '/rooms',
    USERS: '/users',
    NOTIFICATIONS: '/notifications',
};

