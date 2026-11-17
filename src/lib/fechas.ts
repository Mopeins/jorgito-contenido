import { EFEM, ESTRENOS } from './contenido';
import type { FechaPropia, Pilar } from './tipos';

const pad = (n: number) => String(n).padStart(2, '0');
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parse = (s: string) => {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const hoy = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
export const addD = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const lunes = (d: Date) => {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(0, 0, 0, 0);
  return x;
};
export const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const MESL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const fd = (s: string) => {
  const d = parse(s);
  return `${d.getDate()} ${MES[d.getMonth()]}`;
};

export type Evento = {
  date: string;
  n: string;
  pilar: Pilar;
  al?: string;
  v?: boolean;
  nota?: string;
  tipo: 'efe' | 'estreno';
  propiaId?: string;
};

/** Todas las efemérides, estrenos y fechas propias entre dos días (inclusive) */
export function eventos(desde: Date, hasta: Date, propias: FechaPropia[] = []): Evento[] {
  const out: Evento[] = [];
  for (let y = desde.getFullYear(); y <= hasta.getFullYear(); y++) {
    for (const e of EFEM) {
      let d: Date | null = null;
      if (e.r) {
        const [m, dow, n] = e.r;
        d = new Date(y, m - 1, 1);
        while (d.getDay() !== dow) d.setDate(d.getDate() + 1);
        d.setDate(d.getDate() + 7 * (n - 1));
      } else if (e.md) {
        const [m, dd] = e.md.split('-').map(Number);
        d = new Date(y, m - 1, dd);
      }
      if (d && d >= desde && d <= hasta) out.push({ date: iso(d), n: e.n, pilar: 'efemerides', al: e.al, v: e.v, nota: e.nota, tipo: 'efe' });
    }
    for (const p of propias) {
      let d: Date | null = null;
      if (p.md) {
        const [m, dd] = p.md.split('-').map(Number);
        d = new Date(y, m - 1, dd);
      } else if (p.fecha && parse(p.fecha).getFullYear() === y) d = parse(p.fecha);
      if (d && d >= desde && d <= hasta)
        out.push({ date: iso(d), n: p.nombre, pilar: p.pilar, al: p.al, nota: p.nota, tipo: 'efe', propiaId: p.id });
    }
  }
  for (const e of ESTRENOS) {
    const d = parse(e.d);
    if (d >= desde && d <= hasta) out.push({ date: e.d, n: e.n, pilar: 'tendencias', al: 'est', v: e.v, nota: e.nota, tipo: 'estreno' });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
