import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { alcanceN, estadoN } from '@/lib/contenido';
import { MES, parse, type Evento } from '@/lib/fechas';
import { colors } from '@/lib/theme';
import type { Idea } from '@/lib/tipos';
import { useDatos } from '@/providers/datos';

import { Boton, CajaFecha, Fila, Pill, Tag, Tenue, Texto } from './ui';

export function FilaEvento({ e, alGenerar }: { e: Evento; alGenerar?: () => void }) {
  const router = useRouter();
  const { ideas } = useDatos();
  const d = parse(e.date);
  const ya = ideas.filter((i) => i.evento === e.n && (i.fecha_publicacion ?? '').slice(0, 4) === e.date.slice(0, 4)).length;
  const generar = () => {
    alGenerar?.();
    router.push({
      pathname: '/generador',
      params: e.pilar === 'efemerides' ? { modo: 'diad', evento: e.n, fecha: e.date } : { modo: 'pilar', pilar: e.pilar, tema: e.n },
    } as never);
  };
  return (
    <Fila gap={12} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.linea, alignItems: 'center' }}>
      <CajaFecha dia={d.getDate()} mes={MES[d.getMonth()]} />
      <View style={{ flex: 1, gap: 3 }}>
        <Texto peso="bold">{e.n}</Texto>
        <Fila gap={6} wrap>
          <Pill pilar={e.pilar} />
          {e.al ? <Tag texto={alcanceN(e.al)} /> : null}
          {e.v ? <Tag texto="confirmar fecha" aviso /> : null}
          {ya ? <Tag texto={`${ya} idea${ya > 1 ? 's' : ''}`} /> : null}
        </Fila>
        {e.nota ? <Tenue>{e.nota}</Tenue> : null}
      </View>
      <Boton texto="Generar" chico onPress={generar} />
    </Fila>
  );
}

export function FilaIdea({ i }: { i: Idea }) {
  const router = useRouter();
  const { pasos, propuestas } = useDatos();
  const f = i.fecha_grabacion || i.fecha_publicacion;
  const d = f ? parse(f) : null;
  const ps = pasos.filter((p) => p.idea_id === i.id);
  const pend = propuestas.filter((p) => p.idea_id === i.id && p.estado === 'pendiente').length;
  return (
    <Pressable onPress={() => router.push(`/idea/${i.id}` as never)}>
      <Fila gap={12} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.linea }}>
        <CajaFecha dia={d?.getDate()} mes={d ? MES[d.getMonth()] : undefined} />
        <View style={{ flex: 1, gap: 3 }}>
          <Texto peso="bold">{i.titulo}</Texto>
          <Fila gap={6} wrap>
            <Pill pilar={i.pilar} />
            <Tag texto={estadoN(i.estado)} />
            {ps.length ? <Tag texto={`${ps.filter((p) => p.hecho).length}/${ps.length} pasos`} /> : null}
            {pend ? <Tag texto={`${pend} propuesta${pend > 1 ? 's' : ''}`} aviso /> : null}
          </Fila>
        </View>
      </Fila>
    </Pressable>
  );
}

/** Crea una idea vacía y abre su ficha */
export function useNuevaIdea() {
  const router = useRouter();
  const { crear } = useDatos();
  return async (extra: Record<string, unknown> = {}) => {
    const fila = await crear<{ id: string }>('ideas', { titulo: 'Nueva idea', plataformas: ['Instagram', 'Facebook'], formato: 'Reel / TikTok', ...extra });
    if (fila) router.push(`/idea/${fila.id}` as never);
  };
}
