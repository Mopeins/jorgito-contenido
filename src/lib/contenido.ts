import type { Estado, Pilar, TipoPropuesta } from './tipos';

export const PILARES: Record<Pilar, { n: string; pub: string; desc: string; ej: string[] }> = {
  recetas: {
    n: 'Recetas',
    pub: 'La señora / quien cocina en casa',
    desc: 'Recetas completas y paso a paso, de parrilla y cocina chilena.',
    ej: ['Pollo frito crujiente', 'Costillar a la Coca-Cola', 'Pan de pascua con limón'],
  },
  trucos: {
    n: 'Trucos',
    pub: 'El papá / el parrillero',
    desc: 'Trucos de parrilla y cocina explicando el porqué: aceite, temperatura, cortes y punto.',
    ej: ['La papa frita perfecta: aceite caliente y rejilla, no toalla de papel', 'El punto perfecto de la carne', '5 trucos para la empanada perfecta'],
  },
  tendencias: {
    n: 'Tendencias',
    pub: 'Jóvenes y niños (compran a través de sus padres)',
    desc: 'Películas, juegos, series, famosos y lo que hacen otros creadores: recrearlo, comprobarlo o responderlo.',
    ej: ['La hamburguesa de GTA VI', 'Comida favorita de Iron Man vs. la de Thor', 'Parrilla coreana como la que comió BTS en Chile', 'Comprobar un tip viral de otro creador'],
  },
  versus: {
    n: 'Enfrentamientos',
    pub: 'Latinoamérica (seguidores de otros países)',
    desc: 'País contra país y mundiales por llaves. La gente vota y la conversación se arma sola.',
    ej: ['Mundial de carnes: mismo corte, 8 orígenes', 'Salsa verde chilena vs. guasacaca venezolana', 'Chucrut (Alemania) vs. relish (EE.UU.)'],
  },
  efemerides: {
    n: 'Días D',
    pub: 'Todos',
    desc: 'Días nacionales e internacionales. Cada fecha da 3 piezas: receta, truco o challenge, y versus.',
    ej: ['Día del Completo (24 may)', 'Día del Pisco: 2 piscos en 3 preparaciones, vota', 'Día del Amante del Queso: el mejor queso para la hamburguesa'],
  },
};
export const PK = Object.keys(PILARES) as Pilar[];

export const ESTADOS: [Estado, string][] = [
  ['idea', 'Idea'],
  ['aprobada', 'Aprobada'],
  ['guion', 'Guion listo'],
  ['grabacion', 'Por grabar'],
  ['edicion', 'En edición'],
  ['publicada', 'Publicada'],
];
export const estadoN = (k: string) => (ESTADOS.find((e) => e[0] === k) ?? ['', 'Idea'])[1];

export const FORMATOS = ['Reel / TikTok', 'YouTube largo', 'Short', 'Carrusel', 'Historia', 'Live'];
export const PLATS = ['Instagram', 'Facebook', 'TikTok', 'YouTube'];

export const TIPOS_PROPUESTA: Record<TipoPropuesta, { n: string; campo?: 'titulo' | 'gancho' | 'guion' | 'cta' }> = {
  titulo: { n: 'Título', campo: 'titulo' },
  gancho: { n: 'Gancho', campo: 'gancho' },
  guion: { n: 'Guion', campo: 'guion' },
  cta: { n: 'Cierre / CTA', campo: 'cta' },
  copy: { n: 'Copy' },
  miniatura: { n: 'Miniatura' },
  mejora: { n: 'Mejora' },
  marca: { n: 'Integración de marca' },
};

export const MARCA =
  'Jorgito Parrillero es un creador de contenido chileno (Rancagua) de parrilla y cocina. Tono cercano, chileno y con humor; su frase es "Bailamos un poquito". Publica en Instagram, Facebook, TikTok y YouTube y quiere crecer en Chile y en toda Latinoamérica. Trabaja con marcas como Coca-Cola, Chevrolet y Kunstmann (sugiere una integración de marca solo si calza de forma natural).';

export const REGLAS =
  'Escribe en español chileno natural, sin abusar de modismos. Las ideas deben ser concretas y grabables en casa con una o dos cámaras. Para enfrentamientos, indica cómo votar en cada plataforma: Instagram con sticker de encuesta o comentario; Facebook con reacciones (la encuesta de Instagram no se replica en Facebook); YouTube y TikTok comentando. Responde SOLO con JSON válido, sin texto antes ni después.';

export const FORMA_IDEA =
  '{"titulo":"","pilar":"recetas|trucos|tendencias|versus|efemerides","formato":"","gancho":"frase de los primeros 3 segundos","guion":["escena o paso 1","..."],"cta":"cierre y llamado a la acción","votacion":"cómo votar en cada plataforma, solo si es enfrentamiento","insumos":"ingredientes o materiales clave","por_que":"por qué puede funcionar"}';

/* ---------------- Efemérides ----------------
   al: cl = Chile, int = internacional, lat = otro país de Latinoamérica (sirve para versus)
   v: true = confirmar fecha antes de grabar
   r: [mes, díaSemana (0=dom), n-ésimo] para fechas móviles */
export type Efe = { md?: string; r?: [number, number, number]; n: string; al: 'cl' | 'int' | 'lat'; v?: boolean; nota?: string };

export const EFEM: Efe[] = [
  { md: '01-01', n: 'Año Nuevo', al: 'int' },
  { md: '01-16', n: 'Día Internacional de la Croqueta', al: 'int' },
  { md: '01-16', n: 'Día de la Comida Picante', al: 'int', v: true },
  { md: '01-19', n: 'Día de las Palomitas de Maíz', al: 'int', v: true },
  { md: '01-20', n: 'Día del Amante del Queso', al: 'int', v: true },
  { md: '01-30', n: 'Día Internacional del Croissant', al: 'int' },
  { md: '01-30', n: 'Expo Vino y Gastronomía (Valparaíso)', al: 'cl', v: true },
  { md: '02-08', n: 'Día de la Piscola', al: 'cl', nota: 'Marca aliada Coca-Cola: piscola perfecta, 3 formas de servirla' },
  { md: '02-09', n: 'Día Mundial de la Pizza', al: 'int', nota: 'Pizza a la parrilla' },
  { md: '03-25', n: 'Día Internacional del Waffle', al: 'int', v: true, nota: 'Probar versión salada' },
  { md: '03-31', n: 'Día Nacional del Taco (México)', al: 'lat', nota: 'Versus: taco mexicano vs. versión chilena' },
  { md: '04-08', n: 'Día de la Empanada', al: 'cl', nota: 'Pino al horno vs. frita; 5 trucos para la empanada perfecta' },
  { md: '04-15', n: 'Día Nacional de la Cocina Chilena', al: 'cl' },
  { md: '05-08', n: 'Día de la Coca-Cola', al: 'int', v: true, nota: 'Marca aliada: menú completo con Coca-Cola (cebolla caramelizada, costillar, postre)' },
  { r: [5, 0, 2], n: 'Día de la Madre (Chile)', al: 'cl', nota: 'Receta para regalonear a la mamá' },
  { md: '05-13', n: 'Día Internacional del Hummus', al: 'int' },
  { md: '05-15', n: 'Día Nacional del Pisco', al: 'cl', nota: '2 piscos en 3 preparaciones (piscola, sour, solo): que la gente vote' },
  { md: '05-16', n: 'Día de la Churrasca (propuesto)', al: 'cl', v: true },
  { md: '05-24', n: 'Día del Completo', al: 'cl', nota: 'Completo vs. hot dog gringo; chucrut vs. relish' },
  { md: '05-28', n: 'Día Internacional de la Hamburguesa', al: 'int', nota: 'La hamburguesa doble con tocino de Iron Man' },
  { md: '05-30', n: 'Día Internacional de la Papa', al: 'int' },
  { r: [6, 0, 3], n: 'Día del Padre (Chile)', al: 'cl', nota: 'Fecha clave del parrillero: trucos y regalos de parrilla' },
  { md: '06-18', n: 'Día Internacional del Sushi', al: 'int', nota: 'Sushi a la parrilla / sushi de carne' },
  { md: '06-24', n: 'Noche de San Juan', al: 'cl', nota: 'Sopaipillas, pebre y cazuela' },
  { md: '06-28', n: 'Día del Ceviche (Perú)', al: 'lat', v: true, nota: 'Versus: ceviche peruano vs. chileno' },
  { md: '07-07', n: 'Día Mundial del Cacao y el Chocolate', al: 'int' },
  { md: '07-10', n: 'Día de la Sopaipilla', al: 'cl', nota: 'Con o sin zapallo; pasadas con chancaca' },
  { r: [7, 0, 3], n: 'Día del Pollo a la Brasa (Perú)', al: 'lat', v: true, nota: 'Versus: pollo a la brasa peruano vs. pollo asado chileno' },
  { r: [8, 5, 1], n: 'Día Internacional de la Cerveza', al: 'int', nota: 'Marca aliada Kunstmann: maridaje cerveza y parrilla' },
  { md: '08-20', n: 'Día Mundial de las Papas Fritas', al: 'int', nota: 'La papa frita perfecta: aceite, temperatura y rejilla' },
  { md: '09-04', n: 'Día Nacional del Vino', al: 'cl' },
  { md: '09-05', n: 'Día Internacional del Bacon', al: 'int' },
  { r: [9, 6, 2], n: 'Día Mundial de la Arepa', al: 'lat', nota: 'Versus para la comunidad venezolana' },
  { md: '09-13', n: 'Día Internacional del Chocolate', al: 'int' },
  { md: '09-18', n: 'Fiestas Patrias', al: 'cl', nota: 'Asado dieciochero, empanadas, anticuchos, choripán con pebre' },
  { md: '10-16', n: 'Día Mundial de la Alimentación', al: 'int' },
  { md: '10-16', n: 'Día Mundial del Pan', al: 'int', v: true, nota: 'Marraqueta vs. hallulla' },
  { md: '10-20', n: 'Día del Churrasco', al: 'cl', nota: 'Churrasco italiano vs. Barros Luco' },
  { md: '11-01', n: 'Día Mundial del Veganismo', al: 'int' },
  { r: [11, 4, 4], n: 'Acción de Gracias (EE.UU.)', al: 'int', nota: 'Pavo a la parrilla, versión chilena' },
  { md: '11-24', n: 'Día del Carmenere', al: 'cl', nota: 'Maridaje carmenere y parrilla' },
  { md: '12-24', n: 'Nochebuena', al: 'cl', nota: 'Pan de pascua con limón, pavo asado o pollo' },
  { md: '12-31', n: 'Año Nuevo: la parrilla de fin de año', al: 'cl' },
];

export const ESTRENOS: { d: string; n: string; v?: boolean; nota?: string }[] = [
  { d: '2026-11-19', n: 'Lanzamiento GTA VI', nota: 'Recrear la comida del juego' },
  { d: '2026-11-21', n: '50 años de Rocky', v: true, nota: 'Rocky en la cámara de frío: cocinar ese corte' },
  { d: '2026-12-17', n: 'Estreno Avengers: Doomsday (Chile)', nota: 'Comida favorita de Robert Downey Jr. vs. la del equipo rival' },
  { d: '2026-12-17', n: 'Estreno Dune: Parte 3 (Chile)', v: true },
];

export const alcanceN = (al?: string) =>
  al === 'cl' ? 'Chile' : al === 'lat' ? 'Latam' : al === 'est' ? 'Estreno' : al === 'int' ? 'Internacional' : '';

/** Flujo sugerido para una idea nueva (el servidor ya crea uno base) */
export const PASOS_BASE = [
  'Validar la idea con Jorgito',
  'Escribir guion y gancho',
  'Comprar insumos / conseguir producto',
  'Grabar',
  'Editar',
  'Escribir copy y hashtags',
  'Publicar en todas las plataformas',
  'Revisar resultados a las 48 horas',
];
