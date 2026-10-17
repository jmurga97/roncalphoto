CREATE TABLE `pending_photo_uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`upload_id` text,
	`idempotency_key` text NOT NULL,
	`request_fingerprint` text NOT NULL,
	`photo_id` text NOT NULL,
	`session_id` text NOT NULL,
	`alt` text NOT NULL,
	`about` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`iso` integer,
	`aperture` text,
	`shutter_speed` text,
	`lens` text,
	`camera` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`finalized_at` text,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pending_photo_uploads_upload_id_unique` ON `pending_photo_uploads` (`upload_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `pending_photo_uploads_idempotency_unique` ON `pending_photo_uploads` (`idempotency_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `pending_photo_uploads_photo_id_unique` ON `pending_photo_uploads` (`photo_id`);--> statement-breakpoint
CREATE INDEX `pending_photo_uploads_session_idx` ON `pending_photo_uploads` (`session_id`);--> statement-breakpoint
CREATE INDEX `pending_photo_uploads_status_idx` ON `pending_photo_uploads` (`status`);