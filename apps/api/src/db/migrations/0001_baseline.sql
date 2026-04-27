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
INSERT INTO `tags` (`id`, `name`, `slug`) VALUES
  ('tag-architecture', 'Arquitectura', 'arquitectura'),
  ('tag-nature', 'Naturaleza', 'naturaleza');
--> statement-breakpoint
INSERT INTO `sessions` (`id`, `slug`, `title`, `description`, `created_at`) VALUES
  ('sess-urban-lines', 'lineas-urbanas', 'Lineas Urbanas', '<p>Sesion de formas, volumen y ritmo urbano.</p>', '2026-01-15T09:00:00.000Z'),
  ('sess-forest-light', 'luz-del-bosque', 'Luz del Bosque', '<p>Sesion de naturaleza y texturas en luz suave.</p>', '2026-01-10T09:00:00.000Z');
--> statement-breakpoint
INSERT INTO `session_tags` (`session_id`, `tag_id`) VALUES
  ('sess-urban-lines', 'tag-architecture'),
  ('sess-forest-light', 'tag-nature');
--> statement-breakpoint
INSERT INTO `photos` (
  `id`,
  `session_id`,
  `url`,
  `miniature`,
  `alt`,
  `about`,
  `sort_order`,
  `iso`,
  `aperture`,
  `shutter_speed`,
  `lens`,
  `camera`
) VALUES
  (
    'photo-urban-1',
    'sess-urban-lines',
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Escalera helicoidal en edificio moderno',
    'Geometria interior y contraste de sombras.',
    0,
    200,
    'f/4',
    '1/80',
    '24-70mm f/2.8',
    'Canon EOS R5'
  ),
  (
    'photo-urban-2',
    'sess-urban-lines',
    'https://images.pexels.com/photos/1838640/pexels-photo-1838640.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1838640/pexels-photo-1838640.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Rascacielos en contrapicado',
    'Perspectiva vertical para enfatizar escala.',
    1,
    100,
    'f/8',
    '1/250',
    '16-35mm f/4',
    'Canon EOS R5'
  ),
  (
    'photo-forest-1',
    'sess-forest-light',
    'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Bosque en tonos otono',
    'Capas de color y niebla ligera.',
    0,
    400,
    'f/5.6',
    '1/125',
    '70-200mm f/2.8',
    'Canon EOS R5'
  );
