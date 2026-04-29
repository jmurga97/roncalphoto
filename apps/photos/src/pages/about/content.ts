export interface AboutPanelSection {
  id: string;
  kicker: string;
  paragraphs: string[];
  title: string;
}

export const ABOUT_PANEL_INTRO = {
  kicker: "Sobre nosotros",
  title: "Fotografía con sensibilidad para lo irrepetible.",
  paragraphs: [
    "En RoncalPhoto entendemos la fotografía como una forma de observar con calma aquello que sucede una sola vez. Nos interesa la luz que transforma un espacio, el gesto que aparece sin aviso y la emoción que apenas dura unos segundos, pero permanece durante años.",
    "Trabajamos cada proyecto con mirada editorial, sensibilidad artística y atención al detalle para construir imágenes honestas, elegantes y profundamente memorables. Nuestro objetivo no es solo documentar, sino traducir la atmósfera de cada lugar y cada historia en una imagen con presencia propia.",
  ],
} as const;

export const ABOUT_PANEL_SECTIONS: AboutPanelSection[] = [
  {
    id: "architecture",
    kicker: "Arquitectura",
    title: "Luz, materia y escala contadas con precisión.",
    paragraphs: [
      "Fotografiamos arquitectura e interiores buscando el equilibrio entre forma, textura y atmósfera. Cada encuadre está pensado para revelar la intención del espacio, su relación con la luz y la manera en que invita a ser habitado.",
      "Desde estudios de arquitectura hasta hoteles, restaurantes o proyectos residenciales, creamos imágenes que comunican diseño con claridad y al mismo tiempo conservan una lectura sensible, sobria y contemporánea.",
    ],
  },
  {
    id: "events",
    kicker: "Eventos",
    title: "Ritmo, energía y presencia en cada instante.",
    paragraphs: [
      "En eventos nos movemos con discreción y atención plena para capturar lo que no se puede repetir: una bienvenida espontánea, una mirada compartida, la energía precisa de un espacio cuando todo sucede al mismo tiempo.",
      "Buscamos imágenes vivas, fluidas y bien compuestas, capaces de transmitir tanto la identidad del evento como la experiencia emocional de quienes lo vivieron.",
    ],
  },
  {
    id: "weddings",
    kicker: "Bodas",
    title: "Emoción auténtica para recuerdos que siguen creciendo.",
    paragraphs: [
      "En bodas nos importa preservar la intimidad de cada historia sin intervenir más de lo necesario. Observamos con sensibilidad para anticipar esos segundos mínimos en los que todo se condensa: una respiración, un abrazo, una sonrisa inesperada.",
      "El resultado es una narrativa visual delicada y atemporal, pensada para que cada imagen conserve su verdad incluso cuando el tiempo la vuelva recuerdo.",
    ],
  },
];

export const ABOUT_PANEL_CLOSING = [
  "Nos atraen los proyectos con identidad, las personas que valoran la belleza de lo auténtico y los espacios donde cada detalle tiene intención.",
  "Si algo define nuestro trabajo es la capacidad de mirar con sensibilidad para convertir momentos fugaces en imágenes con profundidad, carácter y permanencia.",
] as const;
