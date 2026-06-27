USE convogate_db;

-- 1. Clear any residual data in key tables to avoid foreign key issues
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE messages;
TRUNCATE TABLE message_status;
TRUNCATE TABLE chat_rooms;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Insert safe fake test users (passwords are 'password123')
INSERT INTO users (user_id, first_name, last_name, username, email, password_hash, created_at)
VALUES 
(1, 'Alice', 'Smith', 'alice', 'alice@example.com', 'pbkdf2_sha256$1000000$pXzeZgHaqceIiGpeHYbKm8$Bmk9HA4B6ZGZkqHHV4l0uuGM+Yfo9t5Pp1CGb+7gaiA=', CURRENT_TIMESTAMP),
(2, 'Bob', 'Jones', 'bob', 'bob@example.com', 'pbkdf2_sha256$1000000$pXzeZgHaqceIiGpeHYbKm8$Bmk9HA4B6ZGZkqHHV4l0uuGM+Yfo9t5Pp1CGb+7gaiA=', CURRENT_TIMESTAMP);

-- 3. Create a public demo group chat room (administered by Alice)
INSERT INTO chat_rooms (room_id, room_name, is_group, description, admin_user_id, max_members, allow_invites)
VALUES 
(1, 'Demo Lobby', 1, 'Welcome to the ConvoGate public demo lobby!', 1, 50, 1);
