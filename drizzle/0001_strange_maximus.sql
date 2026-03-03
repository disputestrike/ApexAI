CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`action` varchar(100) NOT NULL,
	`description` text,
	`metadata` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int,
	`date` timestamp NOT NULL DEFAULT (now()),
	`totalContacts` int DEFAULT 0,
	`totalSent` int DEFAULT 0,
	`totalResponses` int DEFAULT 0,
	`totalScheduled` int DEFAULT 0,
	`totalShowed` int DEFAULT 0,
	`totalConverted` int DEFAULT 0,
	`responseRate` float DEFAULT 0,
	`scheduleRate` float DEFAULT 0,
	`showRate` float DEFAULT 0,
	`conversionRate` float DEFAULT 0,
	`revenueGenerated` float DEFAULT 0,
	`costPerLead` float DEFAULT 0,
	`roi` float DEFAULT 0,
	`channel` enum('sms','email','voice','social','all') DEFAULT 'all',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `call_recordings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`campaignId` int,
	`messageId` int,
	`duration` int DEFAULT 0,
	`status` enum('completed','no_answer','voicemail','failed','busy') NOT NULL DEFAULT 'completed',
	`outcome` enum('interested','not_interested','callback','scheduled','voicemail','no_answer') NOT NULL DEFAULT 'no_answer',
	`transcript` text,
	`recordingUrl` varchar(1000),
	`aiSummary` text,
	`sentiment` enum('positive','neutral','negative'),
	`scheduledAppointment` boolean DEFAULT false,
	`calledAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `call_recordings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`leadId` int NOT NULL,
	`status` enum('pending','contacted','responded','scheduled','showed','converted','failed','opted_out') NOT NULL DEFAULT 'pending',
	`channel` enum('sms','email','voice','social'),
	`lastContactedAt` timestamp,
	`nextContactAt` timestamp,
	`attempts` int DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaign_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`channels` json DEFAULT ('[]'),
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
	`settings` json DEFAULT ('{}'),
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
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
	`tags` json DEFAULT ('[]'),
	`customFields` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
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
	`metadata` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboardings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientName` varchar(200) NOT NULL,
	`industry` varchar(100),
	`status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`setupDay` timestamp,
	`supportEndDate` timestamp,
	`completedSteps` json DEFAULT ('[]'),
	`notes` text,
	`specialistName` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboardings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`channel` enum('sms','email','voice','social') NOT NULL,
	`subject` varchar(500),
	`body` text NOT NULL,
	`variables` json DEFAULT ('[]'),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
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
