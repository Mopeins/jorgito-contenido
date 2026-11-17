import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

type Acceso = 'cargando' | 'ok' | 'no';
type Estado = {
  cargando: boolean;
  session: Session | null;
  email: string;
  acceso: Acceso;
  admin: boolean;
  revisarAcceso: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const Ctx = createContext<Estado | null>(null);

/** Si el equipo está vacío, el primero en entrar queda como admin; si no, revisa la lista blanca */
async function consultarAcceso(correo: string): Promise<{ v: Acceso; admin: boolean }> {
  const { data: ok } = await supabase.rpc('reclamar_admin');
  if (!ok) return { v: 'no', admin: false };
  const { data } = await supabase.from('equipo').select('rol').eq('email', correo).maybeSingle();
  return { v: 'ok', admin: data?.rol === 'admin' };
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [listoAuth, setListoAuth] = useState(false);
  const [acceso, setAcceso] = useState<{ para: string | null; v: Acceso; admin: boolean }>({ para: null, v: 'cargando', admin: false });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setListoAuth(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setListoAuth(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;
  const email = (session?.user.email ?? '').toLowerCase();

  useEffect(() => {
    if (!userId) return;
    let vigente = true;
    consultarAcceso(email).then((r) => {
      if (vigente) setAcceso({ para: userId, ...r });
    });
    return () => {
      vigente = false;
    };
  }, [userId, email]);

  const revisarAcceso = useCallback(async () => {
    if (!userId) return;
    const r = await consultarAcceso(email);
    setAcceso({ para: userId, ...r });
  }, [userId, email]);

  const cerrarSesion = useCallback(async () => {
    await supabase.auth.signOut();
    setAcceso({ para: null, v: 'cargando', admin: false });
  }, []);

  const vigente = userId && acceso.para === userId;
  const valor = useMemo<Estado>(
    () => ({
      cargando: !listoAuth || (!!userId && !vigente),
      session,
      email,
      acceso: vigente ? acceso.v : 'cargando',
      admin: !!vigente && acceso.admin,
      revisarAcceso,
      cerrarSesion,
    }),
    [listoAuth, userId, vigente, session, email, acceso, revisarAcceso, cerrarSesion],
  );
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useSesion() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSesion fuera de SesionProvider');
  return v;
}
