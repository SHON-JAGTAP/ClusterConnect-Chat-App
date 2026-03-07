-- SQL Database Dump for clusterconnect
-- Generated on 2026-03-07T08:34:18.031Z
-- Server version: MySQL

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

USE clusterconnect;


-- --------------------------------------------------------
-- Table structure for table 'chat_rooms'
-- --------------------------------------------------------

DROP TABLE IF EXISTS chat_rooms;
CREATE TABLE `chat_rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `chat_rooms_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- --------------------------------------------------------
-- Table structure for table 'messages'
-- --------------------------------------------------------

DROP TABLE IF EXISTS messages;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` varchar(36) NOT NULL,
  `recipient_id` varchar(36) NOT NULL,
  `content` text NOT NULL,
  `chat_room` varchar(255) DEFAULT NULL,
  `read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_messages_sender_id` (`sender_id`),
  KEY `idx_messages_recipient_id` (`recipient_id`),
  KEY `idx_messages_chat_room` (`chat_room`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- --------------------------------------------------------
-- Table structure for table 'room_members'
-- --------------------------------------------------------

DROP TABLE IF EXISTS room_members;
CREATE TABLE `room_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_room_user` (`room_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_room_members_room_id` (`room_id`),
  CONSTRAINT `room_members_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `room_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- --------------------------------------------------------
-- Table structure for table 'users'
-- --------------------------------------------------------

DROP TABLE IF EXISTS users;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'offline',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Dumping data for table 'users' (3 record(s))
-- --------------------------------------------------------

INSERT INTO users (id, email, name, password, avatar, status, created_at, updated_at) VALUES ('4473c0e6-1193-11f1-b026-00155dc51da1', 'jagtapshon10@gmail.com', 'Shon Jagtap', NULL, NULL, 'offline', '2026-02-24 15:12:43', '2026-02-24 15:12:43');
INSERT INTO users (id, email, name, password, avatar, status, created_at, updated_at) VALUES ('7528894d-119d-11f1-b026-00155dc51da1', 'jagtapshon@gmail.com', 'shonjagtap', '$2a$10$qSWmchGmAwCAtf2vQK.1s.KVG7/FMhja/VJkCSJ89kIi3BJODv4SS', NULL, 'offline', '2026-02-24 16:25:39', '2026-02-24 16:25:39');
INSERT INTO users (id, email, name, password, avatar, status, created_at, updated_at) VALUES ('dda95e89-1193-11f1-b026-00155dc51da1', 'sar@gmail.com', 'sarthak', '$2a$10$kSfZk4T8N9DTuiiKUDQdyO6E.E7rizX9op0dTRNEjr63Py1R/wxLG', NULL, 'offline', '2026-02-24 15:17:00', '2026-02-24 15:17:00');

SET FOREIGN_KEY_CHECKS=1;
