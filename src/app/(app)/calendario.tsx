import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { Hoja } from '@/components/Hoja';

import { CampoFecha } from '@/components/CampoFecha';
import { FilaEvento, FilaIdea, useNuevaIdea } from '@/components/Filas';
import { Boton, Campo, Card, Chips, Encabezado, Etiqueta, Fila, Tenue, Texto, Titulo, Vacio } from '@/components/ui';
import { PILARES, PK } from '@/lib/contenido';
import { addD, DIAS, eventos, hoy, iso, lunes, MESL, parse } from '@/lib/fechas';
import { alfa, colors, pilarColor } from '@/lib/theme';
import type { Pilar } from '@/lib/tipos';
import { useDatos } from '@/providers/datos';

export default function Calendario() {
  const params = useLocalSearchParams<{ vista?: string }>();
  const [lista, setLista] = useState(params.vista === 'lista');
  const t = hoy();
  const [mes, setMes] = useState(new Date(t.getFullYear(), t.getMonth(), 1));
  const [dia, setDia] = useState<string | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState(false);
  const { ideas, fechas } = useDatos();
  const { width } = useWindowDimensions();
  const chico = width < 700;

  if (lista) return <Lista volver={() => setLista(false)} nuevaFecha={() => setNuevaFecha(true)} modal={nuevaFecha ? <ModalFecha cerrar={() => setNuevaFecha(false)} /> : null} />;

  const ini = lunes(mes);
  const evs = eventos(ini, addD(ini, 41), fechas);
  const celdas = Array.from({ length: 42 }, (_, i) => addD(ini, i));
  return (
    <View>
      <Encabezado titulo={`${MESL[mes.getMonth()]} ${mes.getFullYear()}`} bajada="Días D, estrenos y lo que hay que grabar (🎥) y publicar (📤)">
        <Boton texto="←" onPress={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))} />
        <Boton texto="Hoy" onPress={() => setMes(new Date(t.getFullYear(), t.getMonth(), 1))} />
        <Boton texto="→" onPress={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))} />
        <Boton texto="Todas las fechas" onPress={() => setLista(true)} />
        <Boton texto="+ Fecha propia" onPress={() => setNuevaFecha(true)} />
      </Encabezado>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map((d) => (
          <View key={d} style={{ width: `${100 / 7}%`, padding: 4 }}>
            <Tenue tam={11} style={{ textTransform: 'uppercase' }}>
              {d}
            </Tenue>
          </View>
        ))}
        {celdas.map((d) => {
          const k = iso(d);
          const e = evs.filter((x) => x.date === k);
          const ids = ideas.filter((x) => x.fecha_publicacion === k || x.fecha_grabacion === k);
          const fuera = d.getMonth() !== mes.getMonth();
          const esHoy = k === iso(t);
          return (
            <View key={k} style={{ width: `${100 / 7}%`, padding: 2 }}>
              <Pressable
                onPress={() => setDia(k)}
                style={{
                  minHeight: chico ? 58 : 104,
                  backgroundColor: colors.s1,
                  borderWidth: 1,
                  borderColor: esHoy ? colors.brasa : colors.linea,
                  borderRadius: 9,
                  padding: 5,
                  gap: 3,
                  opacity: fuera ? 0.35 : 1,
                  overflow: 'hidden',
                }}
              >
                <Texto tam={12} peso="bold" color={esHoy ? colors.brasa : colors.tenue}>
                  {d.getDate()}
                  {chico && e.length + ids.length ? <Texto color={colors.brasa}> •</Texto> : null}
                </Texto>
                {!chico &&
                  e.map((x, j) => (
                    <View key={j} style={{ backgroundColor: alfa(pilarColor[x.pilar], 0.16), borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 }}>
                      <Texto tam={11} color={pilarColor[x.pilar]} lineas={1}>
                        {x.n}
                      </Texto>
                    </View>
                  ))}
                {!chico &&
                  ids.map((x) => (
                    <View key={x.id} style={{ backgroundColor: colors.s3, borderLeftWidth: 2, borderLeftColor: pilarColor[x.pilar], borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 }}>
                      <Texto tam={11} lineas={1}>
                        {x.fecha_grabacion === k ? '🎥 ' : '📤 '}
                        {x.titulo}
                      </Texto>
                    </View>
                  ))}
              </Pressable>
            </View>
          );
        })}
      </View>
      <Tenue style={{ marginTop: 12 }}>Las fechas marcadas con “confirmar fecha” conviene validarlas antes de grabar.</Tenue>
      {dia ? <ModalDia k={dia} cerrar={() => setDia(null)} /> : null}
      {nuevaFecha ? <ModalFecha cerrar={() => setNuevaFecha(false)} /> : null}
    </View>
  );
}

function Lista({ volver, nuevaFecha, modal }: { volver: () => void; nuevaFecha: () => void; modal: React.ReactNode }) {
  const { fechas } = useDatos();
  const [f, setF] = useState<'todas' | 'cl' | 'int' | 'lat' | 'est'>('todas');
  const t = hoy();
  const evs = eventos(t, addD(t, 364), fechas).filter((e) => f === 'todas' || e.al === f);
  const meses: Record<string, typeof evs> = {};
  evs.forEach((e) => (meses[e.date.slice(0, 7)] ||= []).push(e));
  const { width } = useWindowDimensions();
  return (
    <View>
      <Encabezado titulo="Fechas de los próximos 12 meses" bajada={`${evs.length} fechas de cocina, bebidas y estrenos. Toca “Generar” para armar las piezas.`}>
        <Boton texto="← Volver al calendario" onPress={volver} />
        <Boton texto="+ Fecha propia" onPress={nuevaFecha} />
      </Encabezado>
      <View style={{ marginBottom: 14 }}>
        <Chips
          valor={f}
          onCambio={setF}
          opciones={[
            ['todas', 'Todas'],
            ['cl', 'Chile'],
            ['int', 'Internacionales'],
            ['lat', 'Latam (para versus)'],
            ['est', 'Estrenos'],
          ]}
        />
      </View>
      <Fila gap={16} wrap style={{ alignItems: 'flex-start' }}>
        {Object.entries(meses).map(([k, es]) => (
          <Card key={k} style={{ flexBasis: width >= 1000 ? '48%' : '100%', flexGrow: 1 }}>
            <Titulo tam={18}>
              {MESL[Number(k.slice(5)) - 1]} {k.slice(0, 4)}
            </Titulo>
            {es.map((e, j) => (
              <FilaEvento key={e.n + j} e={e} />
            ))}
          </Card>
        ))}
      </Fila>
      {!evs.length ? <Vacio>Sin fechas con este filtro</Vacio> : null}
      {modal}
    </View>
  );
}

function ModalDia({ k, cerrar }: { k: string; cerrar: () => void }) {
  const { ideas, fechas, borrar } = useDatos();
  const nueva = useNuevaIdea();
  const d = parse(k);
  const e = eventos(d, d, fechas);
  const ids = ideas.filter((x) => x.fecha_publicacion === k || x.fecha_grabacion === k);
  return (
    <Hoja cerrar={cerrar}>
      <Titulo tam={20}>
        {DIAS[d.getDay()]} {d.getDate()} de {MESL[d.getMonth()].toLowerCase()}
      </Titulo>
      {e.length ? (
        e.map((x, j) => (
          <View key={j}>
            <FilaEvento e={x} alGenerar={cerrar} />
            {x.propiaId ? <Boton texto="Quitar fecha propia" chico tipo="gh" onPress={() => borrar('fechas', x.propiaId!)} style={{ alignSelf: 'flex-end' }} /> : null}
          </View>
        ))
      ) : (
        <Tenue tam={13}>Sin efemérides este día.</Tenue>
      )}
      <Titulo tam={15}>Ideas agendadas</Titulo>
      {ids.length ? ids.map((i) => <FilaIdea key={i.id} i={i} />) : <Tenue tam={13}>Nada agendado.</Tenue>}
      <Fila style={{ justifyContent: 'flex-end' }}>
        <Boton texto="Cerrar" tipo="gh" onPress={cerrar} />
        <Boton
          texto="+ Idea para este día"
          tipo="pri"
          onPress={() => {
            cerrar();
            nueva({ fecha_publicacion: k });
          }}
        />
      </Fila>
    </Hoja>
  );
}

function ModalFecha({ cerrar }: { cerrar: () => void }) {
  const { crear } = useDatos();
  const [n, setN] = useState('');
  const [d, setD] = useState('');
  const [rep, setRep] = useState<'si' | 'no'>('si');
  const [p, setP] = useState<Pilar>('efemerides');
  const [al, setAl] = useState<'cl' | 'int' | 'lat'>('cl');
  const [nota, setNota] = useState('');
  const guardar = async () => {
    if (!n.trim() || !d) return;
    const ok = await crear('fechas', { nombre: n.trim(), pilar: p, al, nota, ...(rep === 'si' ? { md: d.slice(5) } : { fecha: d }) });
    if (ok) cerrar();
  };
  return (
    <Hoja cerrar={cerrar}>
      <Titulo tam={20}>Agregar fecha propia</Titulo>
      <Campo etiqueta="Nombre" value={n} onChangeText={setN} placeholder="Ej: Día del Cacao y el Chocolate" />
      <CampoFecha etiqueta="Fecha" valor={d} onCambio={setD} />
      <Etiqueta>Repetir</Etiqueta>
      <Chips valor={rep} onCambio={setRep} opciones={[['si', 'Todos los años'], ['no', 'Solo esta vez']]} />
      <Etiqueta>Pilar</Etiqueta>
      <Chips valor={p} onCambio={setP} opciones={PK.map((k) => [k, PILARES[k].n] as [Pilar, string])} />
      <Etiqueta>Alcance</Etiqueta>
      <Chips valor={al} onCambio={setAl} opciones={[['cl', 'Chile'], ['int', 'Internacional'], ['lat', 'Latam']]} />
      <Campo etiqueta="Nota / idea rápida" value={nota} onChangeText={setNota} />
      <Fila style={{ justifyContent: 'flex-end' }}>
        <Boton texto="Cancelar" tipo="gh" onPress={cerrar} />
        <Boton texto="Guardar" tipo="pri" onPress={guardar} deshabilitado={!n.trim() || !d} />
      </Fila>
    </Hoja>
  );
}

