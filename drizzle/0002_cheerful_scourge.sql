ALTER TABLE `activity_logs` MODIFY COLUMN `metadata` text;--> statement-breakpoint
ALTER TABLE `campaigns` MODIFY COLUMN `channels` text;--> statement-breakpoint
ALTER TABLE `campaigns` MODIFY COLUMN `settings` text;--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `tags` text;--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `customFields` text;--> statement-breakpoint
ALTER TABLE `messages` MODIFY COLUMN `metadata` text;--> statement-breakpoint
ALTER TABLE `onboardings` MODIFY COLUMN `completedSteps` text;--> statement-breakpoint
ALTER TABLE `templates` MODIFY COLUMN `variables` text;