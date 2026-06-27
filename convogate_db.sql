-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: convogate_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chat_rooms`
--

DROP TABLE IF EXISTS `chat_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_rooms` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `room_name` varchar(100) NOT NULL,
  `is_group` tinyint(1) DEFAULT '0',
  `description` text,
  `room_avatar` varchar(255) DEFAULT NULL,
  `admin_user_id` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `max_members` int DEFAULT '50',
  `allow_invites` tinyint(1) DEFAULT '1',
  `is_private` tinyint(1) DEFAULT '0',
  `has_password` tinyint(1) DEFAULT '0',
  `room_pin` varchar(10) DEFAULT NULL,
  `pin_created_at` timestamp NULL DEFAULT NULL,
  `is_quick_chat` tinyint(1) DEFAULT '0',
  `expiry_time` datetime DEFAULT NULL,
  `is_read_only` tinyint(1) DEFAULT '0',
  `is_saved` tinyint(1) DEFAULT '0',
  `expiry_warning_sent` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`room_id`),
  UNIQUE KEY `room_name` (`room_name`),
  KEY `admin_id` (`admin_user_id`),
  CONSTRAINT `chat_rooms_ibfk_1` FOREIGN KEY (`admin_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expense_payments`
--

DROP TABLE IF EXISTS `expense_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `expense_id` int NOT NULL,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','SUBMITTED','PAID','REJECTED') DEFAULT 'PENDING',
  `payment_method` enum('CASH','UPI','BANK') DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `confirmed_by` int DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `unique_expense_user` (`expense_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `confirmed_by` (`confirmed_by`),
  CONSTRAINT `expense_payments_ibfk_1` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`expense_id`) ON DELETE CASCADE,
  CONSTRAINT `expense_payments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `expense_payments_ibfk_3` FOREIGN KEY (`confirmed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expense_splits`
--

DROP TABLE IF EXISTS `expense_splits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_splits` (
  `split_id` int NOT NULL AUTO_INCREMENT,
  `expense_id` int NOT NULL,
  `user_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` enum('pending','submitted','paid','rejected') DEFAULT 'pending',
  `paid_at` timestamp NULL DEFAULT NULL,
  `payment_method` enum('Cash','UPI External','Bank External') DEFAULT NULL,
  `marked_by_user_id` int DEFAULT NULL,
  `confirmed_by` int DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`split_id`),
  KEY `expense_id` (`expense_id`),
  KEY `user_id` (`user_id`),
  KEY `fk_split_marked_by` (`marked_by_user_id`),
  KEY `fk_confirmed_by` (`confirmed_by`),
  CONSTRAINT `expense_splits_ibfk_1` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`expense_id`) ON DELETE CASCADE,
  CONSTRAINT `expense_splits_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_confirmed_by` FOREIGN KEY (`confirmed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_split_marked_by` FOREIGN KEY (`marked_by_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `expense_id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `t_amount` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`expense_id`),
  KEY `room_id` (`room_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`) ON DELETE CASCADE,
  CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `festival_contributions`
--

DROP TABLE IF EXISTS `festival_contributions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `festival_contributions` (
  `contribution_id` int NOT NULL AUTO_INCREMENT,
  `group_id` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) DEFAULT '0.00',
  `status` varchar(50) DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`contribution_id`),
  KEY `group_id` (`group_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `financial_reminders`
--

DROP TABLE IF EXISTS `financial_reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `financial_reminders` (
  `reminder_id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `expense_id` int DEFAULT NULL,
  `loan_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reminder_id`),
  KEY `room_id` (`room_id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `financial_reminders_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`),
  CONSTRAINT `financial_reminders_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `financial_reminders_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `join_request`
--

DROP TABLE IF EXISTS `join_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `join_request` (
  `join_request_id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `decided_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`join_request_id`),
  UNIQUE KEY `room_id` (`room_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `join_request_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`),
  CONSTRAINT `join_request_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `message_reactions`
--

DROP TABLE IF EXISTS `message_reactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_reactions` (
  `reaction_id` int NOT NULL AUTO_INCREMENT,
  `message_id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `emoji` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reaction_id`),
  UNIQUE KEY `unique_user_reaction` (`message_id`,`user_id`,`emoji`),
  KEY `user_id` (`user_id`),
  KEY `idx_message_reactions_message_id` (`message_id`),
  CONSTRAINT `message_reactions_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE,
  CONSTRAINT `message_reactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `message_status`
--

DROP TABLE IF EXISTS `message_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_status` (
  `status_id` int NOT NULL AUTO_INCREMENT,
  `message_id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('sent','delivered','seen') NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`status_id`),
  UNIQUE KEY `idx_msg_user` (`message_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_message_status_message_id` (`message_id`),
  CONSTRAINT `message_status_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE,
  CONSTRAINT `message_status_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36240 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `message_translations`
--

DROP TABLE IF EXISTS `message_translations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_translations` (
  `translation_id` int NOT NULL AUTO_INCREMENT,
  `message_id` bigint NOT NULL,
  `language_code` varchar(10) NOT NULL,
  `translated_content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`translation_id`),
  UNIQUE KEY `message_id` (`message_id`,`language_code`),
  CONSTRAINT `message_translations_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` bigint NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `sender_user_id` int NOT NULL,
  `parent_message_id` bigint DEFAULT NULL,
  `message_type` enum('text','voice','image','video','document','festival_card','expense','loan') NOT NULL,
  `content` text,
  `voice_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_edited` tinyint(1) DEFAULT '0',
  `last_edited_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`message_id`),
  KEY `fk_parent_msg` (`parent_message_id`),
  KEY `idx_messages_room_created` (`room_id`,`created_at` DESC),
  KEY `idx_messages_sender` (`sender_user_id`),
  CONSTRAINT `fk_parent_msg` FOREIGN KEY (`parent_message_id`) REFERENCES `messages` (`message_id`) ON DELETE SET NULL,
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=191 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `room_id` int DEFAULT NULL,
  `type` enum('join_request','approved','rejected','new_message','removed','expiry_warning') DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `room_members`
--

DROP TABLE IF EXISTS `room_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_members` (
  `room_member_id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role` enum('admin','member') DEFAULT 'member',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`room_member_id`),
  UNIQUE KEY `room_id` (`room_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `room_members_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`),
  CONSTRAINT `room_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `starred_messages`
--

DROP TABLE IF EXISTS `starred_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `starred_messages` (
  `user_id` int NOT NULL,
  `message_id` int NOT NULL,
  `starred_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`message_id`),
  CONSTRAINT `fk_star_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_festival_settings`
--

DROP TABLE IF EXISTS `user_festival_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_festival_settings` (
  `user_id` int NOT NULL,
  `show_banner` tinyint(1) DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `user_id` int NOT NULL,
  `bio` text,
  `status_message` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_settings` (
  `user_id` int NOT NULL,
  `email_notifications` tinyint(1) DEFAULT '1',
  `push_notifications` tinyint(1) DEFAULT '1',
  `sound_notifications` tinyint(1) DEFAULT '1',
  `message_previews` tinyint(1) DEFAULT '1',
  `typing_indicators` tinyint(1) DEFAULT '1',
  `show_online_status` tinyint(1) DEFAULT '1',
  `show_last_seen` tinyint(1) DEFAULT '1',
  `profile_visibility` enum('public','friends','private') DEFAULT 'public',
  `allow_friend_requests` tinyint(1) DEFAULT '1',
  `allow_messages` enum('everyone','friends','none') DEFAULT 'everyone',
  `theme` enum('light','dark','system') DEFAULT 'system',
  `message_density` enum('compact','comfortable','spacious') DEFAULT 'comfortable',
  `font_size` enum('small','medium','large') DEFAULT 'medium',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `dob` date NOT NULL,
  `phone` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `profile_pic` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_online` tinyint(1) DEFAULT '0',
  `last_seen` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'convogate_db'
--
/*!50003 DROP PROCEDURE IF EXISTS `create_user` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `create_user`(
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_username VARCHAR(50),
    IN p_dob DATE,
    IN p_phone VARCHAR(15),
    IN p_email VARCHAR
    (100),
    IN p_password_hash VARCHAR(255),
    IN p_profile_pic VARCHAR(255)
)
BEGIN
    INSERT INTO users (
        first_name,
        last_name,
        username,
        dob,
        phone,
        email,
        password_hash,
        profile_pic
    )
    VALUES (
        p_first_name,
        p_last_name,
        p_username,
        p_dob,
        p_phone,
        p_email,
        p_password_hash,
        p_profile_pic
    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_user_profile` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_user_profile`(IN p_user_id INT)
BEGIN
    SELECT u.user_id,
           u.first_name,
           u.last_name,
           u.username,
           u.dob,
           u.phone,
           u.email,
           u.profile_pic,
           up.bio,
           up.location
    FROM users u
    LEFT JOIN user_profiles up ON u.user_id = up.user_id
    WHERE u.user_id = p_user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_add_contribution` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_contribution`(IN grp_id VARCHAR(255), IN usr_id INT, IN amt DECIMAL(10,2), IN stat VARCHAR(50))
BEGIN
                INSERT INTO festival_contributions (group_id, user_id, amount, status)
                VALUES (grp_id, usr_id, amt, stat);
            END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_add_expense` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_expense`(
        IN p_room_id INT,
        IN p_creator_id INT,
        IN p_title VARCHAR(255),
        IN p_amount DECIMAL(15, 2),
        IN p_description TEXT,
        IN p_split_json JSON
    )
BEGIN
        DECLARE v_expense_id INT;
        DECLARE v_split_user_id INT;
        DECLARE v_split_amount DECIMAL(15, 2);
        DECLARE i INT DEFAULT 0;
        DECLARE v_count INT;
    
        INSERT INTO expenses (room_id, creator_id, title, amount, description)
        VALUES (p_room_id, p_creator_id, p_title, p_amount, p_description);
    
        SET v_expense_id = LAST_INSERT_ID();
        SET v_count = JSON_LENGTH(p_split_json);
    
        WHILE i < v_count DO
            SET v_split_user_id = JSON_UNQUOTE(JSON_EXTRACT(p_split_json, CONCAT('$[', i, '].user_id')));
            SET v_split_amount = JSON_UNQUOTE(JSON_EXTRACT(p_split_json, CONCAT('$[', i, '].amount')));
            
            INSERT INTO expense_splits (expense_id, user_id, amount)
            VALUES (v_expense_id, v_split_user_id, v_split_amount);
            
            SET i = i + 1;
        END WHILE;
    
        SELECT 
            v_expense_id as expense_id,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'split_id', es.split_id,
                    'user_id', es.user_id,
                    'amount', es.amount,
                    'status', es.status,
                    'username', u.username
                )
            ) as created_splits
        FROM expense_splits es
        JOIN users u ON es.user_id = u.user_id
        WHERE es.expense_id = v_expense_id;
    END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_add_loan` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_loan`(
    IN p_room_id INT,
    IN p_lender_id INT,
    IN p_borrower_id INT,
    IN p_amount DECIMAL(15, 2),
    IN p_description TEXT
)
BEGIN
    INSERT INTO loans (room_id, lender_id, borrower_id, amount, description)
    VALUES (p_room_id, p_lender_id, p_borrower_id, p_amount, p_description);
    
    SELECT LAST_INSERT_ID() as loan_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_confirm_payment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_confirm_payment`(
                    IN p_split_id INT,
                    IN p_confirmed_by_user_id INT
                )
BEGIN
                    UPDATE expense_splits 
                    SET status = 'paid', 
                        paid_at = CURRENT_TIMESTAMP,
                        confirmed_by = p_confirmed_by_user_id,
                        confirmed_at = CURRENT_TIMESTAMP
                    WHERE split_id = p_split_id;
                END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_current_festival` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_current_festival`(IN check_date DATE)
BEGIN
                SELECT 
                    f.festival_id, 
                    f.name, 
                    f.theme_color, 
                    f.icon,
                    f.calendar_icon,
                    f.start_date,
                    f.end_date
                FROM festivals f
                WHERE check_date BETWEEN f.start_date AND f.end_date
                LIMIT 1;
            END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_group_contributions` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_group_contributions`(IN grp_id VARCHAR(255))
BEGIN
                SELECT * FROM festival_contributions WHERE group_id = grp_id ORDER BY created_at DESC;
            END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_group_details` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_group_details`(IN p_room_id INT)
BEGIN
                -- Group Info
                SELECT 
                    room_id, room_name, is_group, description, room_avatar, 
                    admin_user_id, is_private, created_at
                FROM chat_rooms
                WHERE room_id = p_room_id AND is_active = 1;

                -- Members
                SELECT 
                    u.user_id, u.username, u.first_name, u.last_name, u.profile_pic,
                    rm.role, rm.joined_at,
                    up.status_message, (u.is_online) AS is_online
                FROM room_members rm
                JOIN users u ON u.user_id = rm.user_id
                LEFT JOIN user_profiles up ON u.user_id = up.user_id
                WHERE rm.room_id = p_room_id;
            END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_message_history` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_message_history`(
    IN p_room_id INT,
    IN p_user_id INT
)
BEGIN
    -- Check room membership
    IF NOT EXISTS (
        SELECT 1
        FROM room_members
        WHERE room_id = p_room_id
          AND user_id = p_user_id
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Access denied';
    END IF;

    -- Fetch messages
    SELECT
        m.message_id,                                   -- r[0]
        m.room_id,                                      -- r[1]
        m.sender_user_id,                               -- r[2]
        u.username AS sender_name,                      -- r[3] ✅
        m.message_type,                                 -- r[4]
        m.content,                                      -- r[5]
        m.voice_url,                                    -- r[6]
        CONVERT_TZ(m.created_at, '+00:00', '+05:30')    -- r[7]
            AS created_at
    FROM messages m
    JOIN users u ON u.user_id = m.sender_user_id
    WHERE m.room_id = p_room_id
    ORDER BY m.created_at ASC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_random_greeting` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_random_greeting`(IN fest_id INT, IN tone_val VARCHAR(50))
BEGIN
                SELECT message_template FROM festival_greetings 
                WHERE festival_id = fest_id AND (tone = tone_val OR tone = 'Happy')
                ORDER BY RAND() LIMIT 1;
            END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_room_balances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_room_balances`(
    IN p_room_id INT
)
BEGIN
    SELECT 
        u.user_id,
        u.username,
        u.profile_pic,
        COALESCE(SUM(balance), 0) as balance
    FROM users u
    JOIN room_members rm ON u.user_id = rm.user_id
    LEFT JOIN (
        -- Amount others owe the user from expenses they created
        SELECT 
            e.creator_id as user_id,
            SUM(es.amount) as balance
        FROM expenses e
        JOIN expense_splits es ON e.expense_id = es.expense_id
        WHERE e.room_id = p_room_id AND es.user_id != e.creator_id AND es.status = 'pending'
        GROUP BY e.creator_id

        UNION ALL

        -- Amount user owes to others from expenses they split
        SELECT 
            es.user_id,
            -SUM(es.amount) as balance
        FROM expense_splits es
        JOIN expenses e ON es.expense_id = e.expense_id
        WHERE e.room_id = p_room_id AND es.user_id != e.creator_id AND es.status = 'pending'
        GROUP BY es.user_id

        UNION ALL

        -- Amount others owe user from loans
        SELECT 
            lender_id as user_id,
            SUM(amount) as balance
        FROM loans
        WHERE room_id = p_room_id AND status = 'pending'
        GROUP BY lender_id

        UNION ALL

        -- Amount user owes others from loans
        SELECT 
            borrower_id as user_id,
            -SUM(amount) as balance
        FROM loans
        WHERE room_id = p_room_id AND status = 'pending'
        GROUP BY borrower_id
    ) b ON u.user_id = b.user_id
    WHERE rm.room_id = p_room_id
    GROUP BY u.user_id, u.username, u.profile_pic;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_room_financial_history` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_room_financial_history`(
                IN p_room_id INT
            )
BEGIN
                SELECT 
                    'expense' as type,
                    e.expense_id as id,
                    e.amount,
                    e.title,
                    e.description,
                    e.created_at,
                    u.username as creator_name,
                    u.profile_pic as creator_pic,
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'split_id', es.split_id,
                                'user_id', es.user_id,
                                'username', su.username,
                                'amount', es.amount,
                                'status', es.status,
                                'paid_at', es.paid_at,
                                'payment_method', es.payment_method,
                                'marked_by_name', (SELECT username FROM users WHERE user_id = es.marked_by_user_id),
                                'confirmed_by_name', (SELECT username FROM users WHERE user_id = es.confirmed_by),
                                'confirmed_at', es.confirmed_at
                            )
                        )
                        FROM expense_splits es
                        JOIN users su ON es.user_id = su.user_id
                        WHERE es.expense_id = e.expense_id
                    ) as details
                FROM expenses e
                JOIN users u ON e.creator_id = u.user_id
                WHERE e.room_id = p_room_id;
            END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_upcoming_festivals` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_upcoming_festivals`()
BEGIN
                SELECT 
                    f.festival_id, 
                    f.name, 
                    f.start_date, 
                    f.end_date,
                    f.theme_color, 
                    f.icon,
                    f.calendar_icon
                FROM festivals f
                WHERE f.end_date >= CURDATE()
                ORDER BY f.start_date ASC
                LIMIT 5;
            END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_user_profile` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_user_profile`(IN p_user_id INT)
BEGIN
            SELECT 
                u.user_id,
                u.first_name,
                u.last_name,
                u.username,
                u.email,
                u.phone,
                u.profile_pic,
                p.bio,
                p.location,
                p.status_message
            FROM users u
            LEFT JOIN user_profiles p ON u.user_id = p.user_id
            WHERE u.user_id = p_user_id;
        END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_join_room` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_join_room`(
    IN p_action VARCHAR(20),
    IN p_room_id INT,
    IN p_user_id INT
)
BEGIN
    IF p_room_id IS NULL OR p_user_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'room_id and user_id required';
    END IF;

    -- REQUEST
    IF p_action = 'request' THEN

        IF EXISTS (
            SELECT 1 FROM room_members
            WHERE room_id = p_room_id AND user_id = p_user_id
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User already in room';
        END IF;

        IF EXISTS (
            SELECT 1 FROM join_request
            WHERE room_id = p_room_id
              AND user_id = p_user_id
              AND status = 'pending'
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Request already pending';
        END IF;

        INSERT INTO join_request (room_id, user_id)
        VALUES (p_room_id, p_user_id);
    END IF;

    -- APPROVE
    IF p_action = 'approve' THEN
        INSERT IGNORE INTO room_members (room_id, user_id, role)
        VALUES (p_room_id, p_user_id, 'member');

        UPDATE join_request
        SET status = 'approved',
            decided_at = NOW()
        WHERE room_id = p_room_id
          AND user_id = p_user_id
          AND status = 'pending';
    END IF;

    -- REJECT
    IF p_action = 'reject' THEN
        UPDATE join_request
        SET status = 'rejected',
            decided_at = NOW()
        WHERE room_id = p_room_id
          AND user_id = p_user_id
          AND status = 'pending';
    END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_manage_reaction` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_manage_reaction`(
                    IN p_action VARCHAR(10), 
                    IN p_message_id BIGINT, 
                    IN p_user_id INT, 
                    IN p_emoji VARCHAR(50)
                )
BEGIN
                    IF p_action = 'add' THEN
                        INSERT IGNORE INTO message_reactions (message_id, user_id, emoji) 
                        VALUES (p_message_id, p_user_id, p_emoji);
                    ELSEIF p_action = 'remove' THEN
                        DELETE FROM message_reactions 
                        WHERE message_id = p_message_id 
                          AND user_id = p_user_id 
                          AND emoji = p_emoji;
                    END IF;
                END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_manage_starred_message` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_manage_starred_message`(
                    IN p_action VARCHAR(10),
                    IN p_user_id INT,
                    IN p_message_id INT
                )
BEGIN
                    IF p_action = 'star' THEN
                        INSERT IGNORE INTO starred_messages (user_id, message_id)
                        VALUES (p_user_id, p_message_id);
                    ELSE
                        DELETE FROM starred_messages 
                        WHERE user_id = p_user_id AND message_id = p_message_id;
                    END IF;
                END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_manage_translation` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_manage_translation`(
            IN p_message_id INT,
            IN p_language_code VARCHAR(10),
            IN p_translated_content TEXT
        )
BEGIN
            INSERT INTO message_translations (message_id, language_code, translated_content)
            VALUES (p_message_id, p_language_code, p_translated_content)
            ON DUPLICATE KEY UPDATE translated_content = p_translated_content;
        END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_mark_loan_repaid` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_mark_loan_repaid`(
    IN p_loan_id INT
)
BEGIN
    UPDATE loans 
    SET status = 'repaid', repaid_at = CURRENT_TIMESTAMP 
    WHERE loan_id = p_loan_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_message_flow` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_message_flow`(
        IN p_action VARCHAR(50),
        IN p_message_id BIGINT,
        IN p_room_id INT,
        IN p_sender_user_id INT,
        IN p_message_type ENUM('text', 'voice', 'image', 'video', 'document', 'festival_card', 'expense', 'loan'),
        IN p_content TEXT,
        IN p_voice_url VARCHAR(255),
        IN p_parent_message_id BIGINT
    )
BEGIN
        IF p_action = 'send' THEN
            INSERT INTO messages (room_id, sender_user_id, parent_message_id, message_type, content, voice_url)
            VALUES (p_room_id, p_sender_user_id, p_parent_message_id, p_message_type, p_content, p_voice_url);
            
            -- Mark status as 'sent' for the sender automatically
            INSERT INTO message_status (message_id, user_id, status)
            VALUES (LAST_INSERT_ID(), p_sender_user_id, 'sent');
        END IF;
    END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_notification_flow` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_notification_flow`(
    IN p_action ENUM('create','read'),
    IN p_user_id INT,
    IN p_type VARCHAR(50),
    IN p_room_id INT,
    IN p_reference_id INT
)
BEGIN
    IF p_action = 'create' THEN
        INSERT INTO notifications (user_id, room_id, type, reference_id)
        VALUES (p_user_id, p_room_id, p_type, p_reference_id);

    ELSEIF p_action = 'read' THEN
        UPDATE notifications
        SET is_read = 1
        WHERE user_id = p_user_id;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_reject_payment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reject_payment`(
                    IN p_split_id INT,
                    IN p_rejected_by_user_id INT
                )
BEGIN
                    UPDATE expense_splits 
                    SET status = 'rejected', 
                        confirmed_by = p_rejected_by_user_id,
                        confirmed_at = CURRENT_TIMESTAMP
                    WHERE split_id = p_split_id;
                END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_room_flow` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_room_flow`(
    IN p_action ENUM('create','rename','deactivate'),
    IN p_room_id INT,
    IN p_room_name VARCHAR(100),
    IN p_user_id INT,
    IN p_is_private TINYINT,
    IN p_max_members INT,
    IN p_allow_invites TINYINT,
    IN p_has_password TINYINT,
    IN p_description VARCHAR(255),
    IN p_room_avatar VARCHAR(255),
    IN p_is_group TINYINT,
    IN p_is_quick_chat TINYINT,
    IN p_expiry_hours INT
)
BEGIN
    DECLARE v_admin INT DEFAULT 0;
    DECLARE v_room_id INT;
    DECLARE v_pin VARCHAR(6);
    DECLARE v_expiry_time DATETIME DEFAULT NULL;

    /* ================= CREATE ROOM ================= */
    IF p_action = 'create' THEN
        -- Calculate Expiry Time (safe relative to DB NOW())
        IF p_is_quick_chat = 1 AND p_expiry_hours > 0 THEN
            SET v_expiry_time = DATE_ADD(NOW(), INTERVAL p_expiry_hours HOUR);
        END IF;

        -- Generate 6-digit PIN
        SET v_pin = LPAD(FLOOR(100000 + RAND() * 900000), 6, '0');

        INSERT INTO chat_rooms (
            room_name,
            admin_user_id,
            is_private,
            max_members,
            allow_invites,
            has_password,
            room_pin,
            pin_created_at,
            is_active,
            description,
            room_avatar,
            is_group,
            is_quick_chat,
            expiry_time
        )
        VALUES (
            p_room_name,
            p_user_id,
            p_is_private,
            p_max_members,
            p_allow_invites,
            p_has_password,
            v_pin,
            NOW(),
            1,
            p_description,
            p_room_avatar,
            p_is_group,
            p_is_quick_chat,
            v_expiry_time
        );

        SET v_room_id = LAST_INSERT_ID();

        INSERT INTO room_members (room_id, user_id, role)
        VALUES (v_room_id, p_user_id, 'admin');

        SELECT v_room_id AS room_id, v_pin AS pin;

    /* ================= ADMIN-ONLY ACTIONS ================= */
    ELSE
        SELECT COUNT(*) INTO v_admin
        FROM chat_rooms
        WHERE room_id = p_room_id
          AND admin_user_id = p_user_id
          AND is_active = 1;

        IF v_admin = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Unauthorized';
        END IF;

        IF p_action = 'rename' THEN
            UPDATE chat_rooms
            SET room_name = p_room_name
            WHERE room_id = p_room_id;
        ELSEIF p_action = 'deactivate' THEN
            UPDATE chat_rooms
            SET is_active = 0
            WHERE room_id = p_room_id;
        END IF;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_room_member_flow` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_room_member_flow`(
    IN p_action ENUM('join','leave','remove'),
    IN p_room_id INT,
    IN p_user_id INT,
    IN p_target_user_id INT
)
BEGIN
    DECLARE v_is_admin INT DEFAULT 0;

    -- ADMIN CHECK (for remove)
    IF p_action = 'remove' THEN
        SELECT COUNT(*) INTO v_is_admin
        FROM chat_rooms
        WHERE room_id = p_room_id AND admin_user_id = p_user_id;

        IF v_is_admin = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Only admin can remove users';
        END IF;
    END IF;

    -- JOIN ROOM
    IF p_action = 'join' THEN
        IF EXISTS (
            SELECT 1 FROM room_members
            WHERE room_id = p_room_id AND user_id = p_user_id
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User already joined';
        END IF;

        INSERT INTO room_members (room_id, user_id, role)
        VALUES (p_room_id, p_user_id, 'member');

    -- LEAVE ROOM
    ELSEIF p_action = 'leave' THEN
        DELETE FROM room_members
        WHERE room_id = p_room_id AND user_id = p_user_id;

    -- REMOVE USER
    ELSEIF p_action = 'remove' THEN
        DELETE FROM room_members
        WHERE room_id = p_room_id AND user_id = p_target_user_id;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_room_pin_flow` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_room_pin_flow`(
    IN p_action ENUM('generate','verify'),
    IN p_room_id INT,        -- only for generate
    IN p_pin VARCHAR(10)     -- only for verify
)
BEGIN
    DECLARE v_pin VARCHAR(10);
    DECLARE v_room_id INT;
    DECLARE v_admin_id INT;

    /* =======================
       GENERATE PIN (ADMIN)
       ONLY ONCE PER ROOM
    ======================= */
    IF p_action = 'generate' THEN

        -- If pin already exists, return it
        SELECT room_pin
        INTO v_pin
        FROM chat_rooms
        WHERE room_id = p_room_id
        LIMIT 1;

        IF v_pin IS NULL OR v_pin = '' THEN
            SET v_pin = LPAD(FLOOR(RAND() * 1000000), 6, '0');

            UPDATE chat_rooms
            SET room_pin = v_pin
            WHERE room_id = p_room_id;
        END IF;

        SELECT v_pin AS room_pin;
    END IF;

    /* =======================
       VERIFY PIN (USER)
    ======================= */
    IF p_action = 'verify' THEN

        SELECT room_id, admin_user_id
        INTO v_room_id, v_admin_id
        FROM chat_rooms
        WHERE room_pin = p_pin
        LIMIT 1;

        IF v_room_id IS NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid PIN';
        END IF;

        SELECT
            'verified' AS status,
            v_room_id AS room_id,
            v_admin_id AS admin_id;
    END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_generated_card` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_save_generated_card`(
  IN p_card_id INT,
  IN p_guest_id INT,
  IN p_content TEXT
)
BEGIN
  INSERT INTO generated_cards (
    card_id,
    guest_id,
    personalized_content,
    pdf_path
  )
  VALUES (
    p_card_id,
    p_guest_id,
    p_content,
    ''
  );
  SELECT LAST_INSERT_ID() AS id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_quick_chat` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_save_quick_chat`(
                IN p_room_id INT,
                IN p_user_id INT
            )
BEGIN
                DECLARE v_is_admin INT;
                
                -- Check if user is admin
                SELECT COUNT(*) INTO v_is_admin
                FROM chat_rooms
                WHERE room_id = p_room_id AND admin_user_id = p_user_id;
                
                IF v_is_admin > 0 THEN
                    -- Mark as SAVED only. Do NOT remove expiry or make read-only yet.
                    UPDATE chat_rooms
                    SET is_saved = 1
                    WHERE room_id = p_room_id;
                    
                    SELECT 1 AS success;
                ELSE
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Unauthorized';
                END IF;
            END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_send_message` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_send_message`(
    IN p_room_id BIGINT,
    IN p_sender_user_id BIGINT,
    IN p_content TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM room_members
        WHERE room_id = p_room_id
          AND user_id = p_sender_user_id
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'User is not a room member';
    END IF;

    INSERT INTO messages (room_id, sender_user_id, content)
    VALUES (p_room_id, p_sender_user_id, p_content);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_sidebar_rooms` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sidebar_rooms`(IN p_user_id INT)
BEGIN
        -- 1. CREATED ROOMS (User is ADMIN via room_members)
        SELECT 
            r.room_id,
            r.room_name,
            CASE 
                WHEN r.is_group = 1 THEN r.room_avatar 
                ELSE (
                    SELECT u.profile_pic FROM room_members rm2
                    JOIN users u ON rm2.user_id = u.user_id
                    WHERE rm2.room_id = r.room_id AND rm2.user_id != p_user_id
                    LIMIT 1
                )
            END AS avatar,
            -- Derived is_quick_chat
            CASE WHEN r.expiry_time IS NOT NULL THEN 1 ELSE 0 END AS is_quick_chat,
            r.expiry_time,
            r.is_read_only,
            -- Last Message Subqueries
            (SELECT content FROM messages WHERE room_id = r.room_id ORDER BY created_at DESC LIMIT 1) AS last_message,
            (SELECT created_at FROM messages WHERE room_id = r.room_id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
            
            (SELECT COUNT(*) FROM messages msg 
             LEFT JOIN message_status ms ON msg.message_id = ms.message_id AND ms.user_id = p_user_id
             WHERE msg.room_id = r.room_id 
             AND (ms.status IS NULL OR ms.status != 'seen')
            ) AS unread_count
        FROM chat_rooms r
        JOIN room_members rm ON r.room_id = rm.room_id
        WHERE rm.user_id = p_user_id
        AND rm.role = 'admin'  -- User is ADMIN
        -- ONLY Expiry Logic (no is_active check):
        AND (r.expiry_time IS NULL OR r.expiry_time > NOW() OR r.is_saved = 1)
        ORDER BY last_message_time DESC;

        -- 2. JOINED ROOMS (User is MEMBER via room_members)
        SELECT 
            r.room_id,
            r.room_name,
            CASE 
                WHEN r.is_group = 1 THEN r.room_avatar 
                ELSE (
                    SELECT u.profile_pic FROM room_members rm_creator
                    JOIN users u ON rm_creator.user_id = u.user_id
                    WHERE rm_creator.room_id = r.room_id AND rm_creator.role = 'admin'
                    LIMIT 1
                )
            END AS avatar,
            -- Derived is_quick_chat
            CASE WHEN r.expiry_time IS NOT NULL THEN 1 ELSE 0 END AS is_quick_chat,
            r.expiry_time,
            r.is_read_only,
            -- Last Message Subqueries
            (SELECT content FROM messages WHERE room_id = r.room_id ORDER BY created_at DESC LIMIT 1) AS last_message,
            (SELECT created_at FROM messages WHERE room_id = r.room_id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
            
             (SELECT COUNT(*) FROM messages msg 
             LEFT JOIN message_status ms ON msg.message_id = ms.message_id AND ms.user_id = p_user_id
             WHERE msg.room_id = r.room_id 
             AND (ms.status IS NULL OR ms.status != 'seen')
            ) AS unread_count
        FROM chat_rooms r
        JOIN room_members rm ON r.room_id = rm.room_id
        WHERE rm.user_id = p_user_id
        AND rm.role = 'member' -- User is MEMBER
        -- ONLY Expiry Logic (no is_active check):
        AND (r.expiry_time IS NULL OR r.expiry_time > NOW() OR r.is_saved = 1)
        ORDER BY last_message_time DESC;
    END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_submit_payment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_submit_payment`(
                    IN p_split_id INT,
                    IN p_payment_method VARCHAR(50),
                    IN p_marked_by_user_id INT
                )
BEGIN
                    UPDATE expense_splits 
                    SET status = 'submitted', 
                        payment_method = p_payment_method, 
                        marked_by_user_id = p_marked_by_user_id
                    WHERE split_id = p_split_id;
                END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_message_status` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_message_status`(
            IN p_message_id BIGINT,
            IN p_user_id INT,
            IN p_status ENUM('sent', 'delivered', 'seen')
        )
BEGIN
            INSERT INTO message_status (message_id, user_id, status)
            VALUES (p_message_id, p_user_id, p_status)
            ON DUPLICATE KEY UPDATE status = p_status;
        END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_presence` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_presence`(IN p_user_id INT, IN p_is_online BOOLEAN)
BEGIN
                    UPDATE users SET is_online = p_is_online, last_seen = NOW() WHERE user_id = p_user_id;
                END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_user_profile` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_user_profile`(
            IN p_user_id INT,
            IN p_first_name VARCHAR(50),
            IN p_last_name VARCHAR(50),
            IN p_email VARCHAR(100),
            IN p_phone VARCHAR(20),
            IN p_bio VARCHAR(200),
            IN p_location VARCHAR(100),
            IN p_status_message VARCHAR(255)
        )
BEGIN
            UPDATE users 
            SET first_name = p_first_name,
                last_name = p_last_name,
                email = p_email,
                phone = p_phone
            WHERE user_id = p_user_id;
            
            INSERT INTO user_profiles (user_id, bio, location, status_message)
            VALUES (p_user_id, p_bio, p_location, p_status_message)
            ON DUPLICATE KEY UPDATE 
                bio = VALUES(bio),
                location = VALUES(location),
                status_message = VALUES(status_message);
        END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_user_flow` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_user_flow`(
    IN p_action ENUM('update_profile','deactivate'),
    IN p_user_id INT,
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_profile_pic VARCHAR(255)
)
BEGIN
    IF p_action = 'update_profile' THEN
        UPDATE users
        SET first_name = p_first_name,
            last_name = p_last_name,
            profile_pic = p_profile_pic,
            updated_at = NOW()
        WHERE user_id = p_user_id;

    ELSEIF p_action = 'deactivate' THEN
        UPDATE users SET is_active = 0 WHERE user_id = p_user_id;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `update_user_profile` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `update_user_profile`(
    IN p_user_id INT,
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_username VARCHAR(50),
    IN p_dob DATE,
    IN p_phone VARCHAR(15),
    IN p_email VARCHAR(100),
    IN p_profile_pic VARCHAR(255),
    IN p_bio VARCHAR(200),
    IN p_location VARCHAR(100)
)
BEGIN
    -- Update users table
    UPDATE users
    SET first_name = p_first_name,
        last_name = p_last_name,
        username = p_username,
        dob = p_dob,
        phone = p_phone,
        email = p_email,
        profile_pic = p_profile_pic
    WHERE user_id = p_user_id;

    -- Update or insert user_profiles table
    INSERT INTO user_profiles (user_id, bio, location)
    VALUES (p_user_id, p_bio, p_location)
    ON DUPLICATE KEY UPDATE
        bio = VALUES(bio),
        location = VALUES(location);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-27 10:38:48
