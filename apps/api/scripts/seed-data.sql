-- Seed data for local development
-- Auth users
INSERT INTO `user` (
  `id`,
  `name`,
  `email`,
  `emailVerified`,
  `image`,
  `createdAt`,
  `updatedAt`
) VALUES
  (
    'user-murgapj',
    'Murga PJ',
    'murgapj@gmail.com',
    1,
    NULL,
    CAST(strftime('%s', 'now') AS INTEGER) * 1000,
    CAST(strftime('%s', 'now') AS INTEGER) * 1000
  ),
  (
    'user-juanmurga97',
    'Juan Murga',
    'juanmurga97@gmail.com',
    1,
    NULL,
    CAST(strftime('%s', 'now') AS INTEGER) * 1000,
    CAST(strftime('%s', 'now') AS INTEGER) * 1000
  )
ON CONFLICT(`email`) DO UPDATE SET
  `name` = excluded.`name`,
  `emailVerified` = excluded.`emailVerified`,
  `updatedAt` = excluded.`updatedAt`;
--> statement-breakpoint
-- Tags
INSERT OR IGNORE INTO `tags` (`id`, `name`, `slug`) VALUES
  ('tag-architecture', 'Arquitectura', 'arquitectura'),
  ('tag-nature', 'Naturaleza', 'naturaleza');
--> statement-breakpoint

INSERT OR IGNORE INTO `tags` (`id`, `name`, `slug`) VALUES
  ('tag-portrait', 'Retrato', 'retrato'),
  ('tag-editorial', 'Editorial', 'editorial'),
  ('tag-wedding', 'Boda', 'boda'),
  ('tag-night', 'Nocturna', 'nocturna'),
  ('tag-documentary', 'Documental', 'documental'),
  ('tag-bw', 'Blanco y Negro', 'blanco-y-negro'),
  ('tag-experimental', 'Experimental', 'experimental');
--> statement-breakpoint

-- Sessions
INSERT OR IGNORE INTO `sessions` (`id`, `slug`, `title`, `description`, `created_at`) VALUES
  ('sess-urban-lines', 'lineas-urbanas', 'Lineas Urbanas', '<p>Sesion de formas, volumen y ritmo urbano.</p>', '2026-01-15T09:00:00.000Z'),
  ('sess-forest-light', 'luz-del-bosque', 'Luz del Bosque', '<p>Sesion de naturaleza y texturas en luz suave.</p>', '2026-01-10T09:00:00.000Z');
--> statement-breakpoint

INSERT OR IGNORE INTO `sessions` (`id`, `slug`, `title`, `description`, `created_at`) VALUES
  (
    'sess-portrait-editorial-a',
    'retrato-editorial',
    'Retrato Editorial',
    '<p>Retratos con direccion de arte para una narrativa de estudio.</p><p><strong>Color</strong>, gesto y ritmo editorial en una misma serie.</p>',
    '2026-02-01T10:00:00.000Z'
  ),
  (
    'sess-portrait-editorial-b',
    'retrato-editorial-2',
    'Retrato Editorial II',
    '<p>Segunda sesion del mismo universo visual, pensada para probar colisiones de slug y variaciones de orden.</p>',
    '2026-02-01T10:00:00.000Z'
  ),
  (
    'sess-wedding-rain',
    'boda-en-la-lluvia',
    'Boda en la Lluvia',
    '<p>Una boda intima con lluvia fina, reflejos y movimiento.</p><p><em>Documental</em> y editorial conviven en esta cobertura.</p>',
    '2026-01-28T08:30:00.000Z'
  ),
  (
    'sess-documentary-atelier',
    'cronica-del-atelier',
    'Cronica del Atelier',
    '<p>Seguimiento de proceso en taller con textura, polvo y herramientas.</p>',
    '2026-01-22T12:00:00.000Z'
  ),
  (
    'sess-night-essay',
    'ensayo-nocturno',
    'Ensayo Nocturno',
    '<p>Exploracion nocturna de escaparates, neon y calles vacias.</p>',
    '2026-01-18T20:15:00.000Z'
  );
--> statement-breakpoint

-- Session tags
INSERT OR IGNORE INTO `session_tags` (`session_id`, `tag_id`) VALUES
  ('sess-urban-lines', 'tag-architecture'),
  ('sess-forest-light', 'tag-nature');
--> statement-breakpoint

INSERT OR IGNORE INTO `session_tags` (`session_id`, `tag_id`) VALUES
  ('sess-portrait-editorial-a', 'tag-portrait'),
  ('sess-portrait-editorial-a', 'tag-editorial'),
  ('sess-portrait-editorial-a', 'tag-bw'),
  ('sess-portrait-editorial-b', 'tag-portrait'),
  ('sess-portrait-editorial-b', 'tag-editorial'),
  ('sess-wedding-rain', 'tag-wedding'),
  ('sess-wedding-rain', 'tag-editorial'),
  ('sess-wedding-rain', 'tag-documentary'),
  ('sess-documentary-atelier', 'tag-documentary'),
  ('sess-documentary-atelier', 'tag-bw'),
  ('sess-night-essay', 'tag-night');
--> statement-breakpoint

-- Photos (baseline)
INSERT OR IGNORE INTO `photos` (
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
--> statement-breakpoint

-- Photos (expansion)
INSERT OR IGNORE INTO `photos` (
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
    'photo-portrait-editorial-1',
    'sess-portrait-editorial-a',
    'https://picsum.photos/id/1011/1920/1280',
    'https://picsum.photos/id/1011/400/267',
    'Retrato frontal con fondo continuo',
    'Primer plano con gesto contenido y luz suave de estudio.',
    0,
    125,
    'f/2',
    '1/200',
    '85mm f/1.8',
    'Sony A7 IV'
  ),
  (
    'photo-portrait-editorial-2',
    'sess-portrait-editorial-a',
    'https://picsum.photos/id/1012/1920/1280',
    'https://picsum.photos/id/1012/400/267',
    'Perfil con sombra marcada',
    'La direccion de luz dibuja volumen sobre el rostro.',
    1,
    320,
    NULL,
    NULL,
    '50mm f/1.4',
    NULL
  ),
  (
    'photo-portrait-editorial-3',
    'sess-portrait-editorial-a',
    'https://picsum.photos/id/1013/1920/1280',
    'https://picsum.photos/id/1013/400/267',
    'Retrato editorial en blanco y negro',
    'Serie pensada para probar orden secundario por id dentro de la misma sesion.',
    1,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'photo-portrait-editorial-4',
    'sess-portrait-editorial-a',
    'https://picsum.photos/id/1014/1920/1280',
    'https://picsum.photos/id/1014/400/267',
    'Figura completa con movimiento',
    'La tela y el gesto generan una lectura mas dinamica.',
    3,
    NULL,
    'f/4',
    '1/160',
    NULL,
    NULL
  ),
  (
    'photo-portrait-editorial-5',
    'sess-portrait-editorial-a',
    'https://picsum.photos/id/1015/1920/1280',
    'https://picsum.photos/id/1015/400/267',
    'Mirada lateral con color saturado',
    'Contraste cromatico y direccion precisa del cuerpo.',
    4,
    200,
    'f/2.8',
    '1/250',
    '24-70mm f/2.8',
    'Sony A7 IV'
  ),
  (
    'photo-portrait-editorial-6',
    'sess-portrait-editorial-a',
    'https://picsum.photos/id/1016/1920/1280',
    'https://picsum.photos/id/1016/400/267',
    'Detalle de manos y vestuario',
    'Plano de apoyo para completar la narrativa visual.',
    5,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'photo-portrait-editorial-ii-1',
    'sess-portrait-editorial-b',
    'https://picsum.photos/id/1018/1920/1280',
    'https://picsum.photos/id/1018/400/267',
    'Retrato con luz lateral dura',
    'La segunda sesion abre con una imagen mas contrastada.',
    0,
    100,
    'f/2.2',
    '1/160',
    '85mm f/1.8',
    'Sony A7 IV'
  ),
  (
    'photo-portrait-editorial-ii-2',
    'sess-portrait-editorial-b',
    'https://picsum.photos/id/1019/1920/1280',
    'https://picsum.photos/id/1019/400/267',
    'Plano medio con chaqueta estructurada',
    'La ropa aporta volumen grafico a la composicion.',
    1,
    250,
    NULL,
    '1/125',
    NULL,
    'Sony A7 IV'
  ),
  (
    'photo-portrait-editorial-ii-3',
    'sess-portrait-editorial-b',
    'https://picsum.photos/id/1020/1920/1280',
    'https://picsum.photos/id/1020/400/267',
    'Rostro sobre fondo neutro',
    'Imagen central para la serie de belleza.',
    2,
    160,
    'f/2.5',
    '1/200',
    '50mm f/1.4',
    'Sony A7 IV'
  ),
  (
    'photo-portrait-editorial-ii-4',
    'sess-portrait-editorial-b',
    'https://picsum.photos/id/1021/1920/1280',
    'https://picsum.photos/id/1021/400/267',
    'Silueta con hombros girados',
    'Pose minima para probar metadata completamente nula.',
    3,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'photo-portrait-editorial-ii-5',
    'sess-portrait-editorial-b',
    'https://picsum.photos/id/1022/1920/1280',
    'https://picsum.photos/id/1022/400/267',
    'Retrato final con encuadre cerrado',
    'Cierre de la serie con una expresion mas directa.',
    4,
    NULL,
    'f/3.2',
    NULL,
    '70-200mm f/2.8',
    NULL
  ),
  (
    'photo-wedding-rain-1',
    'sess-wedding-rain',
    'https://picsum.photos/id/1024/1920/1280',
    'https://picsum.photos/id/1024/400/267',
    'Novios bajo paraguas transparente',
    'La lluvia suma reflejos y textura sin romper la intimidad.',
    0,
    640,
    'f/2',
    '1/250',
    '35mm f/1.4',
    'Canon EOS R6'
  ),
  (
    'photo-wedding-rain-2',
    'sess-wedding-rain',
    'https://picsum.photos/id/1025/1920/1280',
    'https://picsum.photos/id/1025/400/267',
    'Entrada a la ceremonia',
    'Momento de transicion capturado con un encuadre abierto.',
    1,
    800,
    NULL,
    '1/320',
    NULL,
    'Canon EOS R6'
  ),
  (
    'photo-wedding-rain-3',
    'sess-wedding-rain',
    'https://picsum.photos/id/1026/1920/1280',
    'https://picsum.photos/id/1026/400/267',
    'Intercambio de miradas durante los votos',
    'La cobertura mantiene tono documental y cercania.',
    2,
    1000,
    'f/2.8',
    '1/200',
    '70-200mm f/2.8',
    'Canon EOS R6'
  ),
  (
    'photo-wedding-rain-4',
    'sess-wedding-rain',
    'https://picsum.photos/id/1027/1920/1280',
    'https://picsum.photos/id/1027/400/267',
    'Detalle de manos y alianzas',
    'Plano corto para aportar pausa entre escenas amplias.',
    3,
    NULL,
    'f/4',
    NULL,
    '100mm Macro',
    NULL
  ),
  (
    'photo-wedding-rain-5',
    'sess-wedding-rain',
    'https://picsum.photos/id/1028/1920/1280',
    'https://picsum.photos/id/1028/400/267',
    'Baile inicial con luces de fiesta',
    'El grano y el movimiento refuerzan la atmosfera de cierre.',
    4,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'photo-wedding-rain-6',
    'sess-wedding-rain',
    'https://picsum.photos/id/1029/1920/1280',
    'https://picsum.photos/id/1029/400/267',
    'Salida entre aplausos',
    'La sesion termina con una imagen de celebracion abierta.',
    5,
    1250,
    'f/2.8',
    '1/400',
    '24-70mm f/2.8',
    'Canon EOS R6'
  ),
  (
    'photo-documentary-atelier-1',
    'sess-documentary-atelier',
    'https://picsum.photos/id/1031/1920/1280',
    'https://picsum.photos/id/1031/400/267',
    'Mesa de trabajo con herramientas',
    'Apertura de la cronica con una vista general del espacio.',
    0,
    400,
    NULL,
    NULL,
    '35mm f/2',
    NULL
  ),
  (
    'photo-documentary-atelier-2',
    'sess-documentary-atelier',
    'https://picsum.photos/id/1032/1920/1280',
    'https://picsum.photos/id/1032/400/267',
    'Manos en pleno proceso',
    'Imagen pensada para cubrir el caso de metadata vacia normalizada.',
    1,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'photo-documentary-atelier-3',
    'sess-documentary-atelier',
    'https://picsum.photos/id/1033/1920/1280',
    'https://picsum.photos/id/1033/400/267',
    'Retrato del artesano en su taller',
    'Momento de pausa que conecta proceso y persona.',
    2,
    500,
    'f/2.8',
    '1/160',
    '50mm f/1.2',
    'Nikon Z6 II'
  ),
  (
    'photo-documentary-atelier-4',
    'sess-documentary-atelier',
    'https://picsum.photos/id/1035/1920/1280',
    'https://picsum.photos/id/1035/400/267',
    'Polvo en suspension sobre la mesa',
    'Detalle ambiental con profundidad corta.',
    3,
    NULL,
    'f/3.5',
    '1/125',
    NULL,
    'Nikon Z6 II'
  ),
  (
    'photo-documentary-atelier-5',
    'sess-documentary-atelier',
    'https://picsum.photos/id/1036/1920/1280',
    'https://picsum.photos/id/1036/400/267',
    'Cierre del taller al final de la jornada',
    'La ultima imagen resume textura, espacio y calma.',
    4,
    640,
    'f/4',
    '1/80',
    '24-70mm f/4',
    'Nikon Z6 II'
  );
