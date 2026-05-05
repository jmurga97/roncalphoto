-- RoncalPhoto baseline schema
-- Domain model: sessions + tags + photos

PRAGMA foreign_keys = ON;

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
CREATE INDEX `idx_photos_session` ON `photos` (`session_id`);
--> statement-breakpoint
CREATE INDEX `idx_photos_sort` ON `photos` (`session_id`,`sort_order`);
--> statement-breakpoint
CREATE TABLE `session_tags` (
  `session_id` text NOT NULL,
  `tag_id` text NOT NULL,
  PRIMARY KEY(`session_id`, `tag_id`),
  FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_session_tags_session` ON `session_tags` (`session_id`);
--> statement-breakpoint
CREATE INDEX `idx_session_tags_tag` ON `session_tags` (`tag_id`);
--> statement-breakpoint
CREATE TABLE `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL,
  `title` text NOT NULL,
  `description` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_slug_unique` ON `sessions` (`slug`);
--> statement-breakpoint
CREATE INDEX `idx_sessions_slug` ON `sessions` (`slug`);
--> statement-breakpoint
CREATE INDEX `idx_sessions_created_at` ON `sessions` (`created_at`);
--> statement-breakpoint
CREATE TABLE `tags` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `slug` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);
--> statement-breakpoint
