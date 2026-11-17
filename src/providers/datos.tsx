import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { mensajeError, supabase } from '@/lib/supabase';
import type { FechaPropia, Hallazgo, Idea, Informe, Metrica, Miembro, Paso, Propuesta, Referente, Solicitud, Hook } from '@/lib/tipos';

type Tablas = {
  ideas: Idea[];
  pasos: Paso[];
  propuestas: Propuesta[];
  radar: Hallazgo[];
  referentes: Referente[];
  metricas: Metrica[];
  fechas: FechaPropia[];
  informes: Informe[];
  equipo: Miembro[];
  solicitudes: Solicitud[];
  hooks: Hook[];
};
type Nombre = keyof Tablas;

const TABLA: Record<Nombre, { t: string; orden: [string, boolean] }> = {
  ideas: { t: 'ideas', orden: ['creado', false] },
  pasos: { t: 'idea_pasos', orden: ['orden', true] },
  propuestas: { t: 'idea_propuestas', orden: ['creado', false] },
  radar: { t: 'radar', orden: ['fecha', false] },
  referentes: { t: 'referentes', orden: ['creado', true] },
  metricas: { t: 'metricas', orden: ['semana', true] },
  fechas: { t: 'fechas', orden: ['nombre', true] },
  informes: { t: 'informes', orden: ['fecha', false] },
  equipo: { t: 'equipo', orden: ['creado', true] },
  solicitudes: { t: 'solicitudes', orden: ['creado', false] },
  hooks: { t: 'hooks', orden: ['creado', false] },
};
const VACIO: Tablas = { ideas: [], pasos: [], propuestas: [], radar: [], referentes: [], metricas: [], fechas: [], informes: [], equipo: [], solicitudes: [], hooks: [] };

type Ctx = Tablas & {
  listo: boolean;
  error: string | null;
  recargar: (n: Nombre) => Promise<void>;
  /** insert / update / delete con recarga de la tabla; devuelve la fila creada o null si falló */
  crear: <T extends Record<string, unknown>>(n: Nombre, fila: Record<string, unknown>) => Promise<T | null>;
  editar: (n: Nombre, id: string, cambios: Record<string, unknown>, clave?: string) => Promise<boolean>;
  borrar: (n: Nombre, id: string, clave?: string) => Promise<boolean>;
  aviso: string | null;
  avisar: (m: string) => void;
};

const C = createContext<Ctx | null>(null);

export function DatosProvider({ children }: { children: ReactNode }) {
  const [d, setD] = useState<Tablas>(VACIO);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const avisar = useCallback((m: string) => {
    setAviso(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), 2800);
  }, []);

  const recargar = useCallback(async (n: Nombre) => {
    const { t, orden } = TABLA[n];
    const { data, error: e } = await supabase.from(t).select('*').order(orden[0], { ascending: orden[1] }).limit(2000);
    if (e) {
      setError(mensajeError(e));
      return;
    }
    setD((prev) => ({ ...prev, [n]: data ?? [] }));
  }, []);

  useEffect(() => {
    let vivo = true;
    Promise.all((Object.keys(TABLA) as Nombre[]).map(recargar)).then(() => vivo && setListo(true));
    const canal = supabase.channel('cambios');
    const mapa: [string, Nombre][] = [
      ['ideas', 'ideas'],
      ['idea_pasos', 'pasos'],
      ['idea_propuestas', 'propuestas'],
      ['radar', 'radar'],
      ['solicitudes', 'solicitudes'],
      ['informes', 'informes'],
      ['hooks', 'hooks'],
    ];
    for (const [tabla, n] of mapa) {
      canal.on('postgres_changes', { event: '*', schema: 'public', table: tabla }, () => recargar(n));
    }
    canal.subscribe();
    return () => {
      vivo = false;
      supabase.removeChannel(canal);
    };
  }, [recargar]);

  const crear = useCallback(
    async <T extends Record<string, unknown>>(n: Nombre, fila: Record<string, unknown>) => {
      const { data, error: e } = await supabase.from(TABLA[n].t).insert(fila).select().single();
      if (e) {
        avisar('No se pudo guardar: ' + mensajeError(e));
        return null;
      }
      await recargar(n);
      if (n === 'ideas') await recargar('pasos');
      return data as T;
    },
    [recargar, avisar],
  );

  const editar = useCallback(
    async (n: Nombre, id: string, cambios: Record<string, unknown>, clave = 'id') => {
      // Optimista: se ve el cambio al tiro
      setD((prev) => ({
        ...prev,
        [n]: (prev[n] as Record<string, unknown>[]).map((f) => (f[clave] === id ? { ...f, ...cambios } : f)),
      }));
      const { error: e } = await supabase.from(TABLA[n].t).update(cambios).eq(clave, id);
      if (e) {
        avisar('No se pudo guardar: ' + mensajeError(e));
        await recargar(n);
        return false;
      }
      return true;
    },
    [recargar, avisar],
  );

  const borrar = useCallback(
    async (n: Nombre, id: string, clave = 'id') => {
      const { error: e } = await supabase.from(TABLA[n].t).delete().eq(clave, id);
      if (e) {
        avisar('No se pudo borrar: ' + mensajeError(e));
        return false;
      }
      await recargar(n);
      return true;
    },
    [recargar, avisar],
  );

  const valor = useMemo<Ctx>(
    () => ({ ...d, listo, error, recargar, crear, editar, borrar, aviso, avisar }),
    [d, listo, error, recargar, crear, editar, borrar, aviso, avisar],
  );
  return <C.Provider value={valor}>{children}</C.Provider>;
}

export function useDatos() {
  const v = useContext(C);
  if (!v) throw new Error('useDatos fuera de DatosProvider');
  return v;
}
