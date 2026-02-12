-- RoncalPhoto D1 Schema
-- Categories, Sessions, and Photos

-- Drop existing tables if they exist (for clean reset)
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS categories;

-- Categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

-- Sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Photos table
CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  url TEXT NOT NULL,
  miniature TEXT NOT NULL,
  alt TEXT NOT NULL,
  about TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  -- Metadata fields (flattened for simplicity)
  iso INTEGER,
  aperture TEXT,
  shutter_speed TEXT,
  lens TEXT,
  camera TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX idx_sessions_category ON sessions(category_id);
CREATE INDEX idx_photos_session ON photos(session_id);
CREATE INDEX idx_photos_sort ON photos(session_id, sort_order);
CREATE INDEX idx_categories_slug ON categories(slug);


-- Clear existing data
DELETE FROM photos;
DELETE FROM sessions;
DELETE FROM categories;

-- Category: Arquitectura
INSERT INTO categories (id, name, slug) VALUES ('1', 'Arquitectura', 'arquitectura');

-- Session: Estructuras Modernas
INSERT INTO sessions (id, category_id, title, description) VALUES ('arch-01', '1', 'Estructuras Modernas', '<p>Exploración de la arquitectura contemporánea a través de líneas limpias y formas geométricas. Esta serie captura la esencia del diseño moderno en edificios emblemáticos.</p>');

INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-1', 'arch-01', 'https://images.pexels.com/photos/256150/pexels-photo-256150.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/256150/pexels-photo-256150.jpeg?auto=compress&cs=tinysrgb&w=200', 'Edificio moderno con fachada de cristal', 'Fachada de cristal reflejando el cielo azul en un día despejado.', 0, 100, 'f/8', '1/125', '24-70mm f/2.8', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-2', 'arch-01', 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=200', 'Interior de edificio con escaleras modernas', 'Escaleras en espiral que crean un patrón hipnótico desde el vestíbulo.', 1, 400, 'f/4', '1/60', '16-35mm f/4', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-3', 'arch-01', 'https://images.pexels.com/photos/1838640/pexels-photo-1838640.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/1838640/pexels-photo-1838640.jpeg?auto=compress&cs=tinysrgb&w=200', 'Rascacielos visto desde abajo', 'Perspectiva contrapicada que acentúa la verticalidad del edificio.', 2, 200, 'f/11', '1/250', '14mm f/2.8', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-4', 'arch-01', 'https://images.pexels.com/photos/2119713/pexels-photo-2119713.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/2119713/pexels-photo-2119713.jpeg?auto=compress&cs=tinysrgb&w=200', 'Detalle arquitectónico de edificio moderno', 'Líneas geométricas que crean un patrón abstracto en la fachada.', 3, 100, 'f/5.6', '1/200', '70-200mm f/2.8', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-5', 'arch-01', 'https://images.pexels.com/photos/2404843/pexels-photo-2404843.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/2404843/pexels-photo-2404843.jpeg?auto=compress&cs=tinysrgb&w=200', 'Puente moderno al atardecer', 'Estructura de acero y cables iluminada por la luz dorada del atardecer.', 4, 400, 'f/8', '1/60', '24-70mm f/2.8', 'Canon EOS R5');

-- Session: Patrimonio Urbano
INSERT INTO sessions (id, category_id, title, description) VALUES ('arch-02', '1', 'Patrimonio Urbano', '<p>Un recorrido visual por la arquitectura histórica de las ciudades. Edificios que cuentan historias de otras épocas y que siguen siendo parte viva del paisaje urbano.</p>');

INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-6', 'arch-02', 'https://images.pexels.com/photos/1755683/pexels-photo-1755683.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/1755683/pexels-photo-1755683.jpeg?auto=compress&cs=tinysrgb&w=200', 'Edificio histórico con fachada ornamentada', 'Detalles barrocos en la fachada de un edificio del siglo XIX.', 0, 200, 'f/8', '1/160', '24-70mm f/2.8', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-7', 'arch-02', 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=200', 'Calle empedrada con edificios antiguos', 'Perspectiva de una calle histórica al amanecer.', 1, 800, 'f/4', '1/30', '35mm f/1.4', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-8', 'arch-02', 'https://images.pexels.com/photos/2901212/pexels-photo-2901212.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/2901212/pexels-photo-2901212.jpeg?auto=compress&cs=tinysrgb&w=200', 'Claustro de edificio histórico', 'Arcos y columnas que enmarcan un jardín interior.', 2, 400, 'f/5.6', '1/80', '16-35mm f/4', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-9', 'arch-02', 'https://images.pexels.com/photos/2422461/pexels-photo-2422461.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/2422461/pexels-photo-2422461.jpeg?auto=compress&cs=tinysrgb&w=200', 'Torre de iglesia gótica', 'Detalle de los pináculos y gárgolas de una catedral medieval.', 3, 100, 'f/11', '1/320', '70-200mm f/2.8', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-10', 'arch-02', 'https://images.pexels.com/photos/2835436/pexels-photo-2835436.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/2835436/pexels-photo-2835436.jpeg?auto=compress&cs=tinysrgb&w=200', 'Balcones con barandillas de hierro forjado', 'Elementos decorativos típicos de la arquitectura mediterránea.', 4, 200, 'f/4', '1/200', '85mm f/1.4', 'Canon EOS R5');

-- Category: Naturaleza
INSERT INTO categories (id, name, slug) VALUES ('2', 'Naturaleza', 'naturaleza');

-- Session: Paisajes del Norte
INSERT INTO sessions (id, category_id, title, description) VALUES ('nat-01', '2', 'Paisajes del Norte', '<p>Una inmersión en los paisajes agrestes del norte de España. Montañas, valles y cielos dramáticos que capturan la esencia salvaje de la naturaleza.</p>');

INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-11', 'nat-01', 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=200', 'Montañas con niebla al amanecer', 'Capas de montañas emergiendo de la niebla matutina.', 0, 100, 'f/11', '1/60', '70-200mm f/2.8', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-12', 'nat-01', 'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=200', 'Lago de montaña con reflejos', 'Aguas cristalinas reflejando los picos nevados.', 1, 100, 'f/16', '1/30', '16-35mm f/4', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-13', 'nat-01', 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=200', 'Bosque de hayas en otoño', 'Tonos dorados y naranjas en un bosque centenario.', 2, 400, 'f/5.6', '1/80', '24-70mm f/2.8', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-14', 'nat-01', 'https://images.pexels.com/photos/1559825/pexels-photo-1559825.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/1559825/pexels-photo-1559825.jpeg?auto=compress&cs=tinysrgb&w=200', 'Cascada en el bosque', 'Agua sedosa cayendo entre rocas cubiertas de musgo.', 3, 100, 'f/22', '2s', '16-35mm f/4', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-15', 'nat-01', 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=200', 'Atardecer sobre el mar', 'El sol hundiéndose en el horizonte con tonos naranjas y púrpuras.', 4, 100, 'f/8', '1/125', '24-70mm f/2.8', 'Canon EOS R5');

-- Session: Flora Silvestre
INSERT INTO sessions (id, category_id, title, description) VALUES ('nat-02', '2', 'Flora Silvestre', '<p>Macro fotografía de la flora autóctona. Cada imagen revela los detalles ocultos de flores, hojas y texturas que pasan desapercibidos a simple vista.</p>');

INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-16', 'nat-02', 'https://images.pexels.com/photos/56866/garden-rose-red-pink-56866.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/56866/garden-rose-red-pink-56866.jpeg?auto=compress&cs=tinysrgb&w=200', 'Rosa roja con gotas de rocío', 'Pétalos aterciopelados cubiertos de pequeñas gotas de agua.', 0, 200, 'f/2.8', '1/500', '100mm f/2.8 Macro', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-17', 'nat-02', 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=200', 'Campo de lavanda', 'Hileras de lavanda extendiéndose hasta el horizonte.', 1, 100, 'f/8', '1/200', '24-70mm f/2.8', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-18', 'nat-02', 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=200', 'Hojas de helecho con luz filtrada', 'Patrones fractales de un helecho iluminado por luz lateral.', 2, 400, 'f/4', '1/60', '100mm f/2.8 Macro', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-19', 'nat-02', 'https://images.pexels.com/photos/1076607/pexels-photo-1076607.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/1076607/pexels-photo-1076607.jpeg?auto=compress&cs=tinysrgb&w=200', 'Margaritas silvestres', 'Grupo de margaritas en un prado durante la primavera.', 3, 100, 'f/5.6', '1/250', '85mm f/1.4', 'Canon EOS R5');
INSERT INTO photos (id, session_id, url, miniature, alt, about, sort_order, iso, aperture, shutter_speed, lens, camera) VALUES ('photo-20', 'nat-02', 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=200', 'Seta en el bosque', 'Seta silvestre emergiendo entre las hojas caídas del otoño.', 4, 800, 'f/2.8', '1/100', '100mm f/2.8 Macro', 'Canon EOS R5');

-- Category: Retratos
INSERT INTO categories (id, name, slug) VALUES ('3', 'Retratos', 'retratos');
