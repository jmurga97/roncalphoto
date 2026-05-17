CREATE TABLE `photo_upload_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`photo_id` text NOT NULL,
	`session_id` text NOT NULL,
	`original_key` text NOT NULL,
	`main_key` text NOT NULL,
	`thumbnail_key` text NOT NULL,
	`original_filename` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`alt` text NOT NULL,
	`about` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`iso` integer,
	`aperture` text,
	`shutter_speed` text,
	`lens` text,
	`camera` text,
	`status` text DEFAULT 'awaiting_upload' NOT NULL,
	`error_message` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `photo_upload_jobs_photo_id_unique` ON `photo_upload_jobs` (`photo_id`);--> statement-breakpoint
CREATE INDEX `idx_photo_upload_jobs_session` ON `photo_upload_jobs` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_photo_upload_jobs_status` ON `photo_upload_jobs` (`status`);--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`url` text NOT NULL,
	`miniature` text NOT NULL,
	`alt` text NOT NULL,
	`about` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`iso` integer,
	`aperture` text,
	`shutter_speed` text,
	`lens` text,
	`camera` text,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_photos_session` ON `photos` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_photos_sort` ON `photos` (`session_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `session_tags` (
	`session_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`session_id`, `tag_id`),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_session_tags_session` ON `session_tags` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_session_tags_tag` ON `session_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_slug_unique` ON `sessions` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_sessions_slug` ON `sessions` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_sessions_created_at` ON `sessions` (`created_at`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_account_user` ON `account` (`userId`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `idx_session_user` ON `session` (`userId`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer NOT NULL,
	`image` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer,
	`updatedAt` integer
);
