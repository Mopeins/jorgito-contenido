export type Pilar = 'recetas' | 'trucos' | 'tendencias' | 'versus' | 'efemerides';
export type Estado = 'idea' | 'aprobada' | 'guion' | 'grabacion' | 'edicion' | 'publicada';

export type Idea = {
  id: string;
  titulo: string;
  pilar: Pilar;
  formato: string | null;
  estado: Estado;
  fecha_grabacion: string | null;
  fecha_publicacion: string | null;
  plataformas: string[];
  gancho: string;
  guion: string;
  cta: string;
  notas: string;
  evento: string;
  origen: string;
  creado_por: string;
  creado: string;
  editado: string;
};

export type Paso = {
  id: string;
  idea_id: string;
  orden: number;
  titulo: string;
  responsable: string;
  fecha: string | null;
  hecho: boolean;
  hecho_por: string;
  hecho_en: string | null;
};

export type TipoPropuesta = 'titulo' | 'gancho' | 'guion' | 'cta' | 'copy' | 'miniatura' | 'mejora' | 'marca';

export type Propuesta = {
  id: string;
  idea_id: string;
  tipo: TipoPropuesta;
  texto: string;
  autor: string;
  es_ia: boolean;
  estado: 'pendiente' | 'aceptada' | 'descartada';
  resuelta_por: string;
  creado: string;
};

export type Hallazgo = {
  id: string;
  fecha: string;
  referente: string;
  plataforma: string;
  link: string;
  resumen: string;
  oportunidad: string;
  pilar: string;
  vistas: string;
  estado: 'nuevo' | 'usado' | 'descartado';
  origen: string;
};

export type Referente = { id: string; nombre: string; handle: string; plataforma: string };

export type Metrica = {
  id: string;
  semana: string;
  plataforma: string;
  seguidores: number | null;
  alcance: number | null;
  reproducciones: number | null;
  interacciones: number | null;
  top: string;
  notas: string;
};

export type FechaPropia = {
  id: string;
  nombre: string;
  md: string | null;
  fecha: string | null;
  pilar: Pilar;
  al: string;
  nota: string;
};

export type Informe = { id: string; fecha: string; texto: string };
export type Miembro = { email: string; nombre: string | null; rol: 'admin' | 'editor' };

export type Solicitud = {
  id: string;
  tipo: 'ideas' | 'propuestas' | 'radar' | 'informe';
  titulo: string;
  prompt: string;
  destino: Record<string, string | null>;
  estado: 'pendiente' | 'procesando' | 'lista' | 'error';
  resultado: string;
  creado_por: string;
  creado: string;
  resuelto: string | null;
};

export type TipoHook = 'desafio' | 'comparacion' | 'pregunta' | 'promesa' | 'polemica' | 'curiosidad' | 'historia';
export type Hook = {
  id: string;
  original: string;
  adaptado: string;
  tipo: TipoHook;
  por_que: string;
  referente: string;
  plataforma: string;
  link: string;
  vistas: string;
  favorito: boolean;
  usado: boolean;
  origen: string;
  creado: string;
};
