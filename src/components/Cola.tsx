import { View } from 'react-native';

import { HORARIO_COLA, type Pedido } from '@/lib/ia';
import { colors } from '@/lib/theme';
import type { Solicitud } from '@/lib/tipos';
import { useDatos } from '@/providers/datos';

import { Boton, Card, Fila, Tag, Tenue, Texto, Titulo } from './ui';

/** Deja un pedido en la cola de Claude */
export function usePedir() {
  const { crear, avisar } = useDatos();
  return async (p: Pedido) => {
    const ok = await crear('solicitudes', { tipo: p.tipo, titulo: p.titulo, prompt: p.prompt, destino: p.destino ?? {} });
    if (ok) avisar(`Pedido enviado a Claude. Se resuelve ${HORARIO_COLA}.`);
    return !!ok;
  };
}

const hora = (s: string) => {
  const d = new Date(s);
  return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const ETIQUETA: Record<Solicitud['estado'], string> = { pendiente: 'En cola', procesando: 'Claude trabajando', lista: 'Listo', error: 'Con error' };

export function FilaPedido({ s }: { s: Solicitud }) {
  const { borrar } = useDatos();
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.linea, paddingTop: 8, gap: 3 }}>
      <Fila entre>
        <Texto peso="bold" style={{ flex: 1 }} lineas={2}>
          {s.titulo}
        </Texto>
        <Tag texto={ETIQUETA[s.estado]} aviso={s.estado === 'pendiente' || s.estado === 'procesando'} color={s.estado === 'error' ? colors.rojo : undefined} />
      </Fila>
      <Tenue>
        Pedido {hora(s.creado)}
        {s.resuelto ? ` · resuelto ${hora(s.resuelto)}` : ''}
      </Tenue>
      {s.resultado ? <Tenue tam={13}>{s.resultado}</Tenue> : null}
      {s.estado === 'pendiente' ? <Boton texto="Cancelar" chico tipo="gh" onPress={() => borrar('solicitudes', s.id)} style={{ alignSelf: 'flex-start' }} /> : null}
    </View>
  );
}

/** Tarjeta con los pedidos recientes a Claude */
export function ColaPedidos({ filtro, max = 6 }: { filtro?: (s: Solicitud) => boolean; max?: number }) {
  const { solicitudes } = useDatos();
  const lista = solicitudes.filter((s) => (filtro ? filtro(s) : true)).slice(0, max);
  const pend = solicitudes.filter((s) => s.estado === 'pendiente' || s.estado === 'procesando').length;
  return (
    <Card>
      <Fila entre>
        <Titulo tam={18}>Pedidos a Claude</Titulo>
        <Tag texto={`${pend} en cola`} aviso={pend > 0} />
      </Fila>
      <Tenue tam={13}>Claude revisa la cola {HORARIO_COLA} con el plan del equipo, sin costo extra. Las ideas llegan solas al tablero.</Tenue>
      {lista.length ? lista.map((s) => <FilaPedido key={s.id} s={s} />) : <Tenue>Sin pedidos todavía.</Tenue>}
    </Card>
  );
}
