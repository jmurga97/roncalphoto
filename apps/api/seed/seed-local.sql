-- =============================================================================
-- RoncalPhoto · Local seed (Miniflare D1 only)
-- Run with: bun run db:seed:local   (applies migrations, then this file with --local --env local)
-- Re-runnable: deletes the seed rows first (FK cascades clean their children).
-- =============================================================================

DELETE FROM client_deliveries WHERE id = 'seed_delivery';
DELETE FROM sessions WHERE id IN ('seed_session_coast', 'seed_session_portraits', 'seed_session_city');
DELETE FROM tags WHERE id IN ('seed_tag_landscape', 'seed_tag_portrait', 'seed_tag_urban', 'seed_tag_travel');
DELETE FROM user WHERE id = 'seed_admin';

-- Admin account (sign-up is disabled, so OTP login only works for existing users).
-- Locally the OTP is always 000000 (DEV_FIXED_OTP in wrangler.toml [env.local]).
INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt)
VALUES ('seed_admin', 'Juan Murga', 'juanmurga97@gmail.com', 1, unixepoch(), unixepoch());

INSERT INTO tags (id, name, slug) VALUES
  ('seed_tag_landscape', 'Paisaje', 'paisaje'),
  ('seed_tag_portrait', 'Retrato', 'retrato'),
  ('seed_tag_urban', 'Urbano', 'urbano'),
  ('seed_tag_travel', 'Viaje', 'viaje');

INSERT INTO sessions (id, slug, title, description, created_at) VALUES
  ('seed_session_coast', 'costa-norte', 'Costa Norte', 'Acantilados y mareas del Cantábrico al amanecer.', '2026-03-01 08:00:00'),
  ('seed_session_portraits', 'retratos-de-estudio', 'Retratos de estudio', 'Luz suave y fondos neutros.', '2026-04-12 17:30:00'),
  ('seed_session_city', 'ciudad-de-noche', 'Ciudad de noche', 'Neones, lluvia y largas exposiciones.', '2026-05-20 22:15:00');

INSERT INTO session_tags (session_id, tag_id) VALUES
  ('seed_session_coast', 'seed_tag_landscape'),
  ('seed_session_coast', 'seed_tag_travel'),
  ('seed_session_portraits', 'seed_tag_portrait'),
  ('seed_session_city', 'seed_tag_urban'),
  ('seed_session_city', 'seed_tag_travel');

INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES
  ('seed_photo_coast_1', 'seed_session_coast', 'https://picsum.photos/seed/roncal-coast-1/1600/1067', 'https://picsum.photos/seed/roncal-coast-1/400/267', 'Acantilado al amanecer', 'Primera luz sobre el acantilado.', 0, 100, 'f/8', '1/125', 'XF 16-55mm F2.8', 'Fujifilm X-T5'),
  ('seed_photo_coast_2', 'seed_session_coast', 'https://picsum.photos/seed/roncal-coast-2/1600/1067', 'https://picsum.photos/seed/roncal-coast-2/400/267', 'Marea baja', 'Rocas al descubierto con la marea baja.', 1, 200, 'f/11', '1/60', 'XF 16-55mm F2.8', 'Fujifilm X-T5'),
  ('seed_photo_coast_3', 'seed_session_coast', 'https://picsum.photos/seed/roncal-coast-3/1600/1067', 'https://picsum.photos/seed/roncal-coast-3/400/267', 'Faro entre la niebla', 'El faro apenas visible tras la niebla.', 2, 400, 'f/5.6', '1/250', 'XF 50-140mm F2.8', 'Fujifilm X-T5'),
  ('seed_photo_portraits_1', 'seed_session_portraits', 'https://picsum.photos/seed/roncal-portrait-1/1067/1600', 'https://picsum.photos/seed/roncal-portrait-1/267/400', 'Retrato con luz lateral', 'Ventana como única fuente de luz.', 0, 200, 'f/1.8', '1/200', 'FE 85mm F1.8', 'Sony A7 IV'),
  ('seed_photo_portraits_2', 'seed_session_portraits', 'https://picsum.photos/seed/roncal-portrait-2/1067/1600', 'https://picsum.photos/seed/roncal-portrait-2/267/400', 'Retrato en blanco y negro', 'Contraste alto sobre fondo gris.', 1, 400, 'f/2.8', '1/160', 'FE 85mm F1.8', 'Sony A7 IV'),
  ('seed_photo_city_1', 'seed_session_city', 'https://picsum.photos/seed/roncal-city-1/1600/1067', 'https://picsum.photos/seed/roncal-city-1/400/267', 'Calle mojada con neones', 'Reflejos de neón tras la lluvia.', 0, 1600, 'f/1.4', '1/60', 'XF 33mm F1.4', 'Fujifilm X-T5'),
  ('seed_photo_city_2', 'seed_session_city', 'https://picsum.photos/seed/roncal-city-2/1600/1067', 'https://picsum.photos/seed/roncal-city-2/400/267', 'Estelas de tráfico', 'Larga exposición sobre la avenida.', 1, 100, 'f/16', '15s', 'XF 16-55mm F2.8', 'Fujifilm X-T5');

-- Public link: http://localhost:5174/delivery/seed-delivery-token
INSERT INTO client_deliveries (id, token, title, client_email, expires_at)
VALUES ('seed_delivery', 'seed-delivery-token', 'Boda Ana y Luis', 'cliente@roncalphoto.local', datetime('now', '+30 days'));

INSERT INTO delivery_photos (id, delivery_id, url, r2_key, title, taken_at, size_bytes, sort_order) VALUES
  ('seed_delivery_photo_1', 'seed_delivery', 'https://picsum.photos/seed/roncal-delivery-1/2400/1600', 'seed/delivery-1.jpg', 'Ceremonia', '2026-06-06 12:00:00', 2048000, 0),
  ('seed_delivery_photo_2', 'seed_delivery', 'https://picsum.photos/seed/roncal-delivery-2/2400/1600', 'seed/delivery-2.jpg', 'Banquete', '2026-06-06 15:30:00', 1856000, 1),
  ('seed_delivery_photo_3', 'seed_delivery', 'https://picsum.photos/seed/roncal-delivery-3/1600/2400', 'seed/delivery-3.jpg', 'Primer baile', '2026-06-06 22:10:00', 1920000, 2);
