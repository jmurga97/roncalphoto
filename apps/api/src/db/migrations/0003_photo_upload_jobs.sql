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
CREATE UNIQUE INDEX `photo_upload_jobs_photo_id_unique` ON `photo_upload_jobs` (`photo_id`);
--> statement-breakpoint
CREATE INDEX `idx_photo_upload_jobs_session` ON `photo_upload_jobs` (`session_id`);
--> statement-breakpoint
CREATE INDEX `idx_photo_upload_jobs_status` ON `photo_upload_jobs` (`status`);
