import { FORMA_IDEA, MARCA, PILARES, REGLAS, TIPOS_PROPUESTA } from './contenido';
import { supabase } from './supabase';
import type { Idea, Pilar, Propuesta, TipoPropuesta } from './tipos';

/** Llama a la función "ia" de Supabase (la clave de Anthropic vive allá, nunca en la app) */
export async function preguntarIA(prompt: string, image?: { data: string; media_type: string }): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ia', { body: { prompt, image } });
  if (error) {
    let msg = error.message;
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === 'function') {
        const j = await ctx.json();
        if (j?.error) msg = j.error;
      }
    } catch {}
    throw new Error(msg);
  }
  return (data as { text?: string })?.text ?? '';
}

export function leerJSON<T = unknown>(t: string): T {
  const s = String(t || '').replace(/```json|```/g, '');
  const i = s.indexOf('{');
  const j = s.lastIndexOf('}');
  if (i < 0 || j < 0) throw new Error('La IA no devolvió un formato válido. Intenta de nuevo.');
  return JSON.parse(s.slice(i, j + 1)) as T;
}

export type IdeaIA = {
  titulo: string;
  pilar: Pilar;
  formato?: string;
  gancho?: string;
  guion?: string[] | string;
  cta?: string;
  votacion?: string;
  insumos?: string;
  por_que?: string;
  ronda?: string;
};

export function promptPilar(pilar: Pilar, tema: string, formato: string, n: number) {
  const p = PILARES[pilar];
  return `${MARCA}

Pilar: ${p.n} (clave "${pilar}"). Público: ${p.pub}. ${p.desc}
Ejemplos del pilar: ${p.ej.join('; ')}.
Tema o punto de partida: ${tema || 'libre, algo que esté funcionando ahora en redes de comida'}.
Formato principal: ${formato}.

Propón ${n} ideas de video distintas entre sí. ${REGLAS}
Forma: {"ideas":[${FORMA_IDEA}]}`;
}

export function promptDiaD(nombre: string, fecha: string | null, extra: string) {
  return `${MARCA}

Fecha a celebrar: ${nombre}${fecha ? ` (${fecha})` : ''}. ${extra ? 'Detalle extra: ' + extra : ''}
Genera exactamente 3 piezas para esa fecha:
1) una receta (pilar "recetas", público: la señora / quien cocina en casa),
2) un truco o challenge (pilar "trucos", público: el papá / el parrillero),
3) un enfrentamiento entre dos versiones, países o preparaciones donde la gente vote (pilar "versus").
${REGLAS}
Forma: {"ideas":[${FORMA_IDEA}]}`;
}

export function promptMundial(tema: string, paises: string[]) {
  return `${MARCA}

Arma un "Mundial" de comida para redes. Qué compite: ${tema}. Países: ${paises.join(', ')}.
Define ${Math.floor(paises.length / 2)} partidos de la primera ronda (cuartos de final si son 8). Ordena los cruces para que las rivalidades más fuertes (por ejemplo Chile–Argentina o Chile–Perú) solo puedan darse en semifinal o final. Para cada partido, define qué representa cada país (plato, corte o salsa característica) y un video corto. Las rondas siguientes se definen con los votos, así que solo genera la primera ronda.
${REGLAS}
Forma: {"serie":"nombre de la serie","descripcion":"cómo funciona la serie en 2 frases","ideas":[{"ronda":"Cuartos de final","titulo":"País A vs País B: …","pilar":"versus","formato":"Reel / TikTok","gancho":"","guion":[""],"cta":"","votacion":"","insumos":"","por_que":""}]}`;
}

export function promptRadar(resumen: string, referente: string, plataforma: string, oportunidad: string) {
  return `${MARCA}

Otro creador de comida publicó esto: "${resumen}" (${referente} ${plataforma}). ${oportunidad ? 'Oportunidad detectada: ' + oportunidad : ''}
Propón 2 ideas de video de Jorgito que respondan a eso: una que lo replique o lo compruebe ("¿será verdad?") y otra que lo responda con una técnica mejor o una versión chilena. Pilar "tendencias" salvo que encaje mejor otro. ${REGLAS}
Forma: {"ideas":[${FORMA_IDEA}]}`;
}

/** Propuestas para mejorar una idea concreta: quedan pendientes hasta que alguien las acepte */
export function promptPropuestas(idea: Idea, previas: Propuesta[], pedido: string) {
  const p = PILARES[idea.pilar];
  const tipos = Object.entries(TIPOS_PROPUESTA)
    .map(([k, v]) => `"${k}" (${v.n})`)
    .join(', ');
  return `${MARCA}

Estás revisando una idea de video del equipo. Deja propuestas concretas para mejorarla; el equipo decidirá cuáles acepta.

Idea:
- Título: ${idea.titulo}
- Pilar: ${p.n} (público: ${p.pub})
- Formato: ${idea.formato || 'sin definir'}
- Estado: ${idea.estado}
- Gancho actual: ${idea.gancho || '(vacío)'}
- Guion actual: ${idea.guion || '(vacío)'}
- Cierre actual: ${idea.cta || '(vacío)'}
- Notas: ${idea.notas || '(vacío)'}
${previas.length ? `Propuestas que ya se hicieron (no las repitas): ${previas.map((x) => x.texto.slice(0, 80)).join(' | ')}` : ''}
${pedido ? `Pedido específico del equipo: ${pedido}` : 'Prioriza lo que falte: si no hay gancho o guion, propón eso primero.'}

Entrega entre 3 y 5 propuestas. Tipos posibles: ${tipos}. Si el tipo es "guion", escribe el guion completo en pasos numerados en una sola cadena con saltos de línea. Si es "titulo", "gancho" o "cta", escribe el texto final listo para usar, sin explicaciones. Para "copy" escribe el texto del post con hashtags. Escribe en español chileno natural.
Responde SOLO con JSON válido: {"propuestas":[{"tipo":"gancho","texto":"..."}]}`;
}

export function aFilaIdea(x: IdeaIA, extra: { evento?: string; fecha?: string | null; origen: string }) {
  const guion = Array.isArray(x.guion) ? x.guion.map((g, i) => `${i + 1}. ${g}`).join('\n') : x.guion || '';
  return {
    titulo: x.titulo || 'Idea',
    pilar: (PILARES[x.pilar] ? x.pilar : 'recetas') as Pilar,
    formato: x.formato || 'Reel / TikTok',
    estado: 'idea' as const,
    plataformas: ['Instagram', 'Facebook', 'TikTok'],
    gancho: x.gancho || '',
    guion,
    cta: [x.cta, x.votacion ? 'Votación: ' + x.votacion : ''].filter(Boolean).join('\n\n'),
    notas: [x.insumos ? 'Insumos: ' + x.insumos : '', x.por_que ? 'Por qué: ' + x.por_que : ''].filter(Boolean).join('\n'),
    evento: extra.evento || '',
    fecha_publicacion: extra.fecha || null,
    origen: extra.origen,
  };
}

export const esTipoPropuesta = (t: string): t is TipoPropuesta => t in TIPOS_PROPUESTA;

/* ---------------- Cola de pedidos a Claude ----------------
   La app no llama a la IA directamente: deja el pedido en la tabla "solicitudes" y una tarea
   programada (con el plan de Claude del equipo) lo resuelve cada hora y escribe el resultado. */
export type Pedido = {
  tipo: 'ideas' | 'propuestas' | 'radar' | 'informe';
  titulo: string;
  prompt: string;
  destino?: Record<string, string | null | undefined>;
};
export const HORARIO_COLA = 'cada hora, de 8:00 a 23:00';
