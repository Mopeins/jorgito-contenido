import { useRouter } from 'expo-router';
import { useWindowDimensions, View } from 'react-native';

import { ColaPedidos } from '@/components/Cola';
import { FilaEvento, FilaIdea, useNuevaIdea } from '@/components/Filas';
import { Boton, Card, Encabezado, Fila, Tag, Tenue, Texto, Titulo, Vacio } from '@/components/ui';
import { PILARES, PK } from '@/lib/contenido';
import { addD, DIAS, eventos, hoy, iso, MESL } from '@/lib/fechas';
import { colors, pilarColor } from '@/lib/theme';
import { useDatos } from '@/providers/datos';

export default function Hoy() {
  const { ideas, radar, fechas, propuestas } = useDatos();
  const router = useRouter();
  const nueva = useNuevaIdea();
  const { width } = useWindowDimensions();
  const dos = width >= 1000;
  const t = hoy();
  const prox = eventos(t, addD(t, 30), fechas);
  const semana = ideas
    .filter((i) => {
      const f = i.fecha_grabacion || i.fecha_publicacion;
      return f && f >= iso(t) && f <= iso(addD(t, 7)) && i.estado !== 'publicada';
    })
    .sort((a, b) => (a.fecha_grabacion || a.fecha_publicacion || '').localeCompare(b.fecha_grabacion || b.fecha_publicacion || ''));
  const nuevos = radar.filter((r) => r.estado === 'nuevo');
  const pendientes = propuestas.filter((p) => p.estado === 'pendiente');
  const dia = DIAS[t.getDay()];

  return (
    <View>
      <Encabezado titulo="Hola, equipo" bajada={`${dia[0].toUpperCase() + dia.slice(1)} ${t.getDate()} de ${MESL[t.getMonth()].toLowerCase()} · lo que se viene para Jorgito`}>
        <Boton texto="+ Nueva idea" onPress={() => nueva()} />
        <Boton texto="Pedir ideas a Claude" tipo="pri" onPress={() => router.push('/generador' as never)} />
      </Encabezado>

      <Fila gap={12} wrap style={{ marginBottom: 16 }}>
        {PK.map((p) => (
          <Card key={p} borde={pilarColor[p]} style={{ flexGrow: 1, flexBasis: 150, gap: 2 }}>
            <Titulo tam={28}>{ideas.filter((i) => i.pilar === p && i.estado !== 'publicada').length}</Titulo>
            <Tenue>{PILARES[p].n} en curso</Tenue>
          </Card>
        ))}
      </Fila>

      <View style={{ flexDirection: dos ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        <Card style={{ flex: 1, width: dos ? undefined : '100%' }}>
          <Fila entre>
            <Titulo tam={18}>Se viene · próximos 30 días</Titulo>
            <Boton texto="Ver todas" chico tipo="gh" onPress={() => router.push('/calendario?vista=lista' as never)} />
          </Fila>
          {prox.length ? prox.map((e, k) => <FilaEvento key={e.n + k} e={e} />) : <Vacio>Sin fechas en los próximos 30 días</Vacio>}
        </Card>
        <View style={{ flex: 1, gap: 16, width: dos ? undefined : '100%' }}>
          <Card>
            <Titulo tam={18}>Por grabar o publicar esta semana</Titulo>
            {semana.length ? semana.map((i) => <FilaIdea key={i.id} i={i} />) : <Vacio>Nada agendado para los próximos 7 días. Ponle fecha a las ideas del tablero.</Vacio>}
          </Card>
          <Card>
            <Fila entre>
              <Titulo tam={18}>Propuestas por revisar</Titulo>
              <Tag texto={String(pendientes.length)} aviso={pendientes.length > 0} />
            </Fila>
            {pendientes.length ? (
              [...new Set(pendientes.map((p) => p.idea_id))].slice(0, 5).map((id) => {
                const i = ideas.find((x) => x.id === id);
                return i ? <FilaIdea key={id} i={i} /> : null;
              })
            ) : (
              <Vacio>No hay propuestas pendientes.</Vacio>
            )}
          </Card>
          <ColaPedidos max={3} />
          <Card>
            <Fila entre>
              <Titulo tam={18}>Radar de referentes</Titulo>
              <Boton texto={`${nuevos.length} nuevos`} chico tipo="gh" onPress={() => router.push('/radar' as never)} />
            </Fila>
            {nuevos.slice(0, 4).map((r) => (
              <View key={r.id} style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.linea, gap: 2 }}>
                <Fila gap={6}>
                  <Texto peso="bold">{r.referente || 'Hallazgo'}</Texto>
                  {r.plataforma ? <Tag texto={r.plataforma} /> : null}
                </Fila>
                <Tenue lineas={2}>{r.resumen}</Tenue>
              </View>
            ))}
            {!nuevos.length ? <Vacio>Aún no hay hallazgos. El radar diario los irá dejando aquí.</Vacio> : null}
          </Card>
        </View>
      </View>
    </View>
  );
}
