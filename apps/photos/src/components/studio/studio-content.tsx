import { CONTACT_EMAIL, INSTAGRAM_URL, SERVICES } from "@lib/seo/content";

import type { StudioSection } from "./studio-sections";

interface StudioContentProps {
  section?: StudioSection;
  email?: string;
  area?: string;
}

export function StudioContent({ section, email = CONTACT_EMAIL, area = "Valencia" }: StudioContentProps) {
  return (
    <article className={section ? "studio-page" : "studio-document"}>
      {(!section || section === "sobre-mi") && (
        <section className="studio-screen studio-about" id="sobre-mi" aria-labelledby="sobre-mi-title">
          <p className="ui-kicker">Sobre mí · RoncalPhoto · {area}</p>
          <h2 className="studio-headline studio-about-headline" id="sobre-mi-title">
            <span>Mirar despacio.</span>
            <span>Contar lo que</span>
            <span className="studio-headline-accent">importa.</span>
          </h2>
          <div className="studio-about-details">
            <p className="studio-statement">La luz que cambia. Los gestos que aparecen. Lo que no se repite.</p>
            <div className="editorial-prose studio-copy">
              <p>
                Soy María Gabriela Roncal, fotógrafa en {area}. Me interesan las personas, los lugares y esa manera
                particular en la que cada historia se deja ver.
              </p>
              <p>
                Mi mirada combina sensibilidad documental y cuidado por la composición. Observar antes de disparar,
                encontrar la luz y dejar espacio para que las cosas sucedan: así busco imágenes naturales, sin forzar el
                momento.
              </p>
              <p>
                Desde una celebración hasta un interior, quiero que las fotografías conserven algo de lo que se sentía
                estar allí. Imágenes a las que volver y en las que reconocerse.
              </p>
            </div>
          </div>
        </section>
      )}

      {(!section || section === "servicios") && (
        <section className="studio-screen studio-services" id="servicios" aria-labelledby="servicios-title">
          <header className="studio-services-header">
            <div>
              <p className="ui-kicker">Servicios · Fotografía</p>
              <h2 className="studio-headline" id="servicios-title">
                Historias vividas.
                <br />
                <span className="studio-headline-accent">Espacios sentidos.</span>
              </h2>
            </div>
            <p className="editorial-prose studio-copy">
              Cada reportaje empieza por escucharte: qué quieres contar, qué hace especial tu proyecto y cómo vas a
              utilizar las imágenes. A partir de ahí, encontramos una forma de fotografiarlo con intención y
              naturalidad.
            </p>
          </header>
          <div className="studio-services-list">
            {SERVICES.map((service, index) => (
              <section className="studio-service" id={service.slug} key={service.slug}>
                <span className="ui-kicker" aria-hidden="true">
                  0{index + 1}
                </span>
                <h3 className="studio-service-title">{service.name}</h3>
                <p className="editorial-prose studio-copy">{service.description}</p>
              </section>
            ))}
          </div>
          <div className="studio-services-footer" id="presupuesto">
            <p className="studio-statement">Cada proyecto empieza por una conversación.</p>
            <p className="editorial-prose studio-copy">
              Cuéntame qué te gustaría fotografiar, dónde y en qué fecha. Prepararé una propuesta según tu proyecto.{" "}
              <a href={`mailto:${email}?subject=${encodeURIComponent("Consulta de fotografía · RoncalPhoto")}`}>
                Consultar disponibilidad y presupuesto ↗
              </a>
            </p>
          </div>
        </section>
      )}

      {(!section || section === "contacto") && (
        <section className="studio-screen studio-contact" id="contacto" aria-labelledby="contacto-title">
          <p className="ui-kicker">Contacto · Hagamos algo juntos</p>
          <h2 className="studio-headline" id="contacto-title">
            Todo empieza
            <br />
            <span className="studio-headline-accent">con una idea.</span>
          </h2>
          <p className="editorial-prose studio-copy">
            Una fecha, un lugar, una historia por contar. Escríbeme y hablamos de cómo darle forma.
          </p>
          <a className="studio-contact-email" href={`mailto:${email}`}>
            {email}
          </a>
          <div className="studio-contact-links">
            <a className="studio-contact-link ui-link" href={INSTAGRAM_URL} rel="noreferrer" target="_blank">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
              </svg>
              <span>
                Instagram <span aria-hidden="true">↗</span>
              </span>
              <span className="studio-contact-caption">@roncalphoto</span>
            </a>
            <a className="studio-contact-link ui-link" href={`mailto:${email}`}>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="1" />
                <path d="m2 5 10 8L22 5" />
              </svg>
              <span>Correo</span>
              <span className="studio-contact-caption">Escríbeme</span>
            </a>
            <div className="studio-contact-link">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <span>{area}</span>
              <span className="studio-contact-caption">España</span>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
