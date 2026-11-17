import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { useNuevaIdea } from '@/components/Filas';
import { Boton, Chip, Encabezado, Fila, Pill, Tag, Tenue, Texto } from '@/components/ui';
import { ESTADOS, PILARES, PK } from '@/lib/contenido';
import { fd } from '@/lib/fechas';
import { colors, pilarColor } from '@/lib/theme';
import type { Pilar } from '@/lib/tipos';
import { useDatos } from '@/providers/datos';

export default function Ideas() {
  const { ideas, pasos, propuestas, editar } = useDatos();
  const [f, setF] = useState<'todos' | Pilar>('todos');
  const router = useRouter();
  const nueva = useNuevaIdea();
  const lista = ideas.filter((i) => f === 'todos' || i.pilar === f);
  return (
    <View>
      <Encabezado titulo="Tablero de ideas" bajada="De la idea a la publicación. Abre una tarjeta para ver su flujo y las propuestas.">
        <Boton texto="+ Nueva idea" tipo="pri" onPress={() => nueva()} />
      </Encabezado>
      <Fila gap={6} wrap style={{ marginBottom: 14 }}>
        <Chip texto={`Todos (${ideas.length})`} activo={f === 'todos'} onPress={() => setF('todos')} />
        {PK.map((p) => (
          <Chip key={p} texto={`${PILARES[p].n} (${ideas.filter((i) => i.pilar === p).length})`} activo={f === p} onPress={() => setF(p)} />
        ))}
      </Fila>
      <ScrollView horizontal contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
        {ESTADOS.map(([k, n], ix) => {
          const its = lista.filter((i) => i.estado === k);
          return (
            <View key={k} style={{ width: 240, backgroundColor: colors.s1, borderWidth: 1, borderColor: colors.linea, borderRadius: 12, padding: 10, gap: 8, minHeight: 220 }}>
              <Fila entre style={{ paddingHorizontal: 4 }}>
                <Texto tam={13} peso="tituloMedio">
                  {n}
                </Texto>
                <Tenue>{its.length}</Tenue>
              </Fila>
              {its.map((i) => {
                const ps = pasos.filter((p) => p.idea_id === i.id);
                const hechos = ps.filter((p) => p.hecho).length;
                const pend = propuestas.filter((p) => p.idea_id === i.id && p.estado === 'pendiente').length;
                return (
                  <Pressable
                    key={i.id}
                    onPress={() => router.push(`/idea/${i.id}` as never)}
                    style={{ backgroundColor: colors.s2, borderWidth: 1, borderColor: colors.linea, borderLeftWidth: 3, borderLeftColor: pilarColor[i.pilar], borderRadius: 9, padding: 10, gap: 6 }}
                  >
                    <Texto tam={13} peso="bold">
                      {i.titulo}
                    </Texto>
                    <Fila gap={6} wrap>
                      <Pill pilar={i.pilar} />
                      {i.formato ? <Tag texto={i.formato} /> : null}
                      {pend ? <Tag texto={`${pend} propuesta${pend > 1 ? 's' : ''}`} aviso /> : null}
                    </Fila>
                    {ps.length ? (
                      <View style={{ gap: 3 }}>
                        <View style={{ height: 4, backgroundColor: colors.s3, borderRadius: 2, overflow: 'hidden' }}>
                          <View style={{ height: 4, width: `${(hechos / ps.length) * 100}%`, backgroundColor: pilarColor[i.pilar] }} />
                        </View>
                        <Tenue tam={11}>
                          Flujo {hechos}/{ps.length}
                          {ps.find((p) => !p.hecho) ? ` · sigue: ${ps.find((p) => !p.hecho)!.titulo}` : ''}
                        </Tenue>
                      </View>
                    ) : null}
                    {i.fecha_grabacion || i.fecha_publicacion ? (
                      <Tenue tam={11}>
                        {i.fecha_grabacion ? '🎥 ' + fd(i.fecha_grabacion) + '  ' : ''}
                        {i.fecha_publicacion ? '📤 ' + fd(i.fecha_publicacion) : ''}
                      </Tenue>
                    ) : null}
                    <Fila entre>
                      {ix > 0 ? <Boton texto="←" chico tipo="gh" onPress={() => editar('ideas', i.id, { estado: ESTADOS[ix - 1][0] })} /> : <View />}
                      {ix < ESTADOS.length - 1 ? <Boton texto="→" chico tipo="gh" onPress={() => editar('ideas', i.id, { estado: ESTADOS[ix + 1][0] })} /> : null}
                    </Fila>
                  </Pressable>
                );
              })}
              {!its.length ? <Tenue style={{ padding: 6 }}>—</Tenue> : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
