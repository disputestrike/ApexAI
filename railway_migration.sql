-- ApexAI Railway MySQL Migration
-- Run this in Railway MySQL > Database > Data tab (or via MySQL client)
-- Safe to run multiple times (uses IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

CREATE TABLE IF NOT EXISTS `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`action` varchar(100) NOT NULL,
	`description` text,
	`metadata` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `analytics_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`totalLeads` int NOT NULL DEFAULT 0,
	`newLeads` int NOT NULL DEFAULT 0,
	`contactedLeads` int NOT NULL DEFAULT 0,
	`qualifiedLeads` int NOT NULL DEFAULT 0,
	`convertedLeads` int NOT NULL DEFAULT 0,
	`totalCalls` int NOT NULL DEFAULT 0,
	`answeredCalls` int NOT NULL DEFAULT 0,
	`totalMessages` int NOT NULL DEFAULT 0,
	`deliveredMessages` int NOT NULL DEFAULT 0,
	`totalCampaigns` int NOT NULL DEFAULT 0,
	`activeCampaigns` int NOT NULL DEFAULT 0,
	`appointmentsBooked` int NOT NULL DEFAULT 0,
	`revenueGenerated` float NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_snapshots_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `call_recordings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`campaignId` int,
	`duration` int,
	`status` enum('initiated','ringing','answered','completed','failed','no_answer','busy','voicemail') NOT NULL DEFAULT 'initiated',
	`recordingUrl` varchar(1000),
	`transcription` text,
	`sentiment` enum('positive','neutral','negative'),
	`outcome` enum('appointment_booked','callback_requested','not_interested','voicemail','no_answer','follow_up'),
	`notes` text,
	`callerName` varchar(200),
	`phoneNumber` varchar(30),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `call_recordings_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `campaign_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`leadId` int NOT NULL,
	`status` enum('pending','contacted','responded','converted','opted_out','failed') NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`lastContactedAt` timestamp,
	`nextContactAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_contacts_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`channels` text,
	`status` enum('draft','active','paused','completed','archived') NOT NULL DEFAULT 'draft',
	`goal` enum('appointments','demos','sales','awareness','follow_up') NOT NULL DEFAULT 'appointments',
	`industry` varchar(100),
	`startDate` timestamp,
	`endDate` timestamp,
	`dailyLimit` int DEFAULT 50,
	`totalContacts` int DEFAULT 0,
	`sentCount` int DEFAULT 0,
	`responseCount` int DEFAULT 0,
	`scheduledCount` int DEFAULT 0,
	`showCount` int DEFAULT 0,
	`convertedCount` int DEFAULT 0,
	`revenueGenerated` float DEFAULT 0,
	`settings` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(30),
	`company` varchar(200),
	`industry` varchar(100),
	`title` varchar(150),
	`linkedinUrl` varchar(500),
	`website` varchar(500),
	`city` varchar(100),
	`state` varchar(100),
	`country` varchar(100),
	`score` int NOT NULL DEFAULT 0,
	`segment` enum('hot','warm','cold','unqualified') NOT NULL DEFAULT 'cold',
	`verificationStatus` enum('verified','unverified','bounced','pending') NOT NULL DEFAULT 'pending',
	`status` enum('new','contacted','qualified','converted','lost') NOT NULL DEFAULT 'new',
	`source` varchar(100),
	`notes` text,
	`tags` text,
	`customFields` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int,
	`leadId` int NOT NULL,
	`channel` enum('sms','email','voice','social') NOT NULL,
	`direction` enum('outbound','inbound') NOT NULL DEFAULT 'outbound',
	`status` enum('queued','sent','delivered','read','replied','failed','bounced') NOT NULL DEFAULT 'queued',
	`subject` varchar(500),
	`body` text,
	`templateId` int,
	`sentAt` timestamp,
	`deliveredAt` timestamp,
	`readAt` timestamp,
	`repliedAt` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `onboardings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientName` varchar(200) NOT NULL,
	`industry` varchar(100),
	`status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`setupDay` timestamp,
	`supportEndDate` timestamp,
	`completedSteps` text,
	`notes` text,
	`specialistName` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboardings_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`channel` enum('sms','email','voice','social') NOT NULL,
	`subject` varchar(500),
	`body` text NOT NULL,
	`variables` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientName` varchar(200) NOT NULL,
	`industry` varchar(100) NOT NULL,
	`company` varchar(200),
	`quote` text NOT NULL,
	`beforeMetric` varchar(500),
	`afterMetric` varchar(500),
	`specificResult` varchar(500),
	`resultValue` varchar(200),
	`avatarUrl` varchar(1000),
	`isActive` boolean NOT NULL DEFAULT true,
	`featured` boolean NOT NULL DEFAULT false,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `system_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`category` varchar(50) NOT NULL DEFAULT 'general',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_config_key_unique` UNIQUE(`key`)
);

-- Drizzle migrations journal table (required for auto-migration to work)
CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hash` text NOT NULL,
	`created_at` bigint,
	CONSTRAINT `__drizzle_migrations_id` PRIMARY KEY(`id`)
);
