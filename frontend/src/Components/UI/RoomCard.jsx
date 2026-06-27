import React from 'react';
import { Users, Lock, MoreVertical } from 'lucide-react';
import NotificationBadge from './NotificationBadge';
import { getRoomTypeGradient } from '../../Utils/colorUtils';

const RoomCard = ({ room, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`w-full p-4 rounded-xl transition-all duration-200 group cursor-pointer
        ${isActive
          ? 'bg-[var(--active-room-bg)] shadow-sm'
          : 'bg-[var(--surface-light)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--violet-100)] dark:hover:border-[var(--violet-900)] hover:scale-[1.01] hover:shadow-sm'
        }`}
    >
      <div className="flex items-center justify-between">
        {/* LEFT SIDE */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300"
              style={isActive ? { background: 'var(--violet-500)' } : { background: getRoomTypeGradient(room) }}
            >
              <span className="text-base md:text-lg font-semibold text-white">
                {(room.name || 'Room').charAt(0).toUpperCase()}
              </span>
            </div>

            {room.isPrivate && !isActive && (
              <div className="absolute -bottom-1 -right-1 p-1 bg-[var(--surface-light)] rounded-full">
                <Lock className="h-2.5 w-2.5 text-[var(--text-tertiary)]" />
              </div>
            )}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3
                className={`font-semibold truncate text-sm md:text-base
                  ${isActive ? 'text-[var(--active-room-text)]' : 'text-[var(--text-primary)]'}`}
              >
                {room.name}
              </h3>

              {room.unread > 0 && !isActive && (
                <NotificationBadge count={room.unread} size="sm" />
              )}
            </div>

            <p
              className={`text-xs md:text-sm truncate font-medium
                ${isActive ? 'text-[var(--active-room-text)] opacity-80' : 'text-[var(--text-secondary)]'}`}
            >
              {room.lastMessage || room.description || 'No messages yet'}
            </p>

            <div className="flex items-center space-x-3 mt-1">
              <span
                className={`text-xs
                  ${isActive ? 'text-[var(--active-room-text)] opacity-60' : 'text-[var(--text-tertiary)]'}`}
              >
                {room.time || 'Just now'}
              </span>

              {room.memberCount !== undefined && (
                <div
                  className={`flex items-center space-x-1
                    ${isActive ? 'text-[var(--active-room-text)] opacity-60' : 'text-[var(--text-tertiary)]'}`}
                >
                  <Users className="h-3 w-3" />
                  <span className="text-xs">{room.memberCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OPTIONS BUTTON — SAFE & ISOLATED */}
        <button
          type="button"
          aria-label={`Options for ${room.name}`}
          onClick={(e) => {
            e.stopPropagation();

          }}
          className={`p-1.5 md:p-2 rounded-lg transition
            md:opacity-0 md:group-hover:opacity-100
            ${isActive
              ? 'hover:bg-black/5 text-[var(--active-room-text)]'
              : 'hover:bg-[var(--surface-active)] text-[var(--text-tertiary)]'
            }`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

RoomCard.defaultProps = {
  room: {
    name: 'Room',
    lastMessage: '',
    time: '',
    isPrivate: false,
    memberCount: 0,
    unread: 0,
  },
  isActive: false,
  onClick: () => { },
};

export default RoomCard;
