CREATE TABLE `client_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`title` text NOT NULL,
	`client_email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` text NOT NULL,
	`photos_deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `client_deliveries_token_unique` ON `client_deliveries` (`token`);--> statement-breakpoint
CREATE INDEX `idx_client_deliveries_expires_at` ON `client_deliveries` (`expires_at`);--> statement-breakpoint
CREATE TABLE `delivery_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`delivery_id` text NOT NULL,
	`url` text NOT NULL,
	`r2_key` text NOT NULL,
	`title` text NOT NULL,
	`taken_at` text,
	`size_bytes` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`delivery_id`) REFERENCES `client_deliveries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_delivery_photos_delivery` ON `delivery_photos` (`delivery_id`);