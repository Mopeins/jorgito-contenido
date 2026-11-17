import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, useWindowDimensions, View } from 'react-native';

import { Boton, Campo, Card, Chips, Encabezado, Fila, Pill, Tag, Tenue, Texto, Titulo, Vacio } from '@/components/ui';
import { PLATS } from '@/lib/contenido';
import { fd } from '@/lib/fechas';
import { aFilaIdea, leerJSON, preguntarIA, promptRadar, type IdeaIA } from '@/lib/ia';
import { colors, pilarColor } from '@/lib/theme';
import type { Hallazgo, Pilar } from '@/lib/tipos';
import { useDatos } from '@/providers/datos';

export default function Radar() {
  const { radar, referentes, crear, editar, borrar, avisar } = useDatos();
  const router = useRouter();
  const [f, setF] = useState<'nuevo' | 'usado' | 'descartado' | 'todos'>('nuevo');
  const [ref, setRef] = useState('');
  const [plat, setPlat] = useState('Instagram');
  const [link, setLink] = useState('');
  const [resumen, setResumen] = useState('');
  const [rn, setRn] = useState('');
  const [rh, setRh] = useState('');
  const [rp, setRp] = useState('Instagram');
  const [ocupado, setOcupado] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const dos = width >= 1000;
  const lista = radar.filter((r) => f === 'todos' || r.estado === f);

  const convertir = async (r: Hallazgo) => {
    setOcupado(r.id);
    try {
      const o = leerJSON<{ ideas: IdeaIA[] }>(await preguntarIA(promptRadar(r.resumen, r.referente, r.plataforma, r.oportunidad)));
      let primera: string | null = null;
      for (const x of o.ideas ?? []) {
        const fila = await crear<{ id: string }>('ideas', { ...aFilaIdea({ ...x, pilar: (x.pilar || 'tendencias') as Pilar }, { origen: 'Radar: ' + (r.referente || '') }), notas: `Referencia: ${r.resumen}${r.link ? '\n' + r.link : ''}` });
        primera ||= fila?.id ?? null;
      }
      await editar('radar', r.id, { estado: 'usado' });
      avisar(`${o.ideas?.length ?? 0} ideas nuevas en el tablero`);
      if (primera) router.push(`/idea/${primera}` as never);
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'No se pudo generar');
    }
    setOcupado(null);
  };

  return (
    <View>
      <Encabezado titulo="Radar" bajada="Qué están haciendo los referentes y a qué se puede responder, replicar o comprobar." />
      <View style={{ flexDirection: dos ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        <View style={{ flex: dos ? 2 : undefined, width: dos ? undefined : '100%', gap: 12 }}>
          <Chips
            valor={f}
            onCambio={setF}
            opciones={[
              ['nuevo', `Nuevos (${radar.filter((r) => r.estado === 'nuevo').length})`],
              ['usado', 'Convertidos en idea'],
              ['descartado', 'Descartados'],
              ['todos', `Todos (${radar.length})`],
            ]}
          />
          {lista.map((r) => (
            <Card key={r.id} style={{ borderLeftWidth: 3, borderLeftColor: pilarColor[r.pilar as Pilar] ?? pilarColor.tendencias }}>
              <Fila entre wrap>
                <Fila gap={6} wrap>
                  <Texto peso="bold">{r.referente || 'Hallazgo'}</Texto>
                  {r.plataforma ? <Tag texto={r.plataforma} /> : null}
                  <Pill pilar={r.pilar} />
                  {r.vistas ? <Tag texto={r.vistas} /> : null}
                </Fila>
                <Tenue>{fd(r.fecha)}</Tenue>
              </Fila>
              <Texto>{r.resumen}</Texto>
              {r.oportunidad ? (
                <Texto color={colors.tenue}>
                  <Texto peso="bold">Oportunidad: </Texto>
                  {r.oportunidad}
                </Texto>
              ) : null}
              <Fila wrap>
                {/^https?:\/\//.test(r.link) ? <Boton texto="Ver original" chico onPress={() => Linking.openURL(r.link)} /> : null}
                {r.estado === 'nuevo' ? (
                  <>
                    <Boton texto="Convertir en ideas con IA" chico tipo="pri" cargando={ocupado === r.id} onPress={() => convertir(r)} />
                    <Boton texto="Descartar" chico tipo="gh" onPress={() => editar('radar', r.id, { estado: 'descartado' })} />
                  </>
                ) : (
                  <Boton texto="Volver a nuevos" chico tipo="gh" onPress={() => editar('radar', r.id, { estado: 'nuevo' })} />
                )}
              </Fila>
            </Card>
          ))}
          {!lista.length ? <Vacio>Sin hallazgos en esta lista. El radar diario deja aquí lo que encuentre cada mañana; también pueden pegar uno a mano.</Vacio> : null}
        </View>
        <View style={{ flex: dos ? 1 : undefined, width: dos ? undefined : '100%', gap: 16 }}>
          <Card>
            <Titulo tam={18}>Pegar un hallazgo</Titulo>
            <Campo etiqueta="Quién" value={ref} onChangeText={setRef} placeholder="Ej: Nick DiGiovanni" />
            <Chips valor={plat} onCambio={setPlat} opciones={PLATS.map((p) => [p, p] as [string, string])} />
            <Campo etiqueta="Link" value={link} onChangeText={setLink} placeholder="https://" autoCapitalize="none" />
            <Campo etiqueta="¿Qué hizo o dijo?" value={resumen} onChangeText={setResumen} multiline placeholder="Ej: dice que para descongelar carne rápido hay que…" />
            <Boton
              texto="Guardar"
              tipo="pri"
              deshabilitado={!resumen.trim()}
              style={{ alignSelf: 'flex-start' }}
              onPress={async () => {
                if (await crear('radar', { referente: ref, plataforma: plat, link, resumen: resumen.trim(), origen: 'manual' })) {
                  setRef('');
                  setLink('');
                  setResumen('');
                }
              }}
            />
          </Card>
          <Card>
            <Titulo tam={18}>Referentes que vigila el radar</Titulo>
            {referentes.map((r) => (
              <Fila key={r.id} entre style={{ borderTopWidth: 1, borderTopColor: colors.linea, paddingTop: 8 }}>
                <View>
                  <Texto peso="bold">{r.nombre}</Texto>
                  <Tenue>
                    {r.handle} {r.plataforma}
                  </Tenue>
                </View>
                <Boton texto="Quitar" chico tipo="gh" onPress={() => borrar('referentes', r.id)} />
              </Fila>
            ))}
            {!referentes.length ? <Tenue>Aún no hay referentes.</Tenue> : null}
            <Fila wrap>
              <Campo value={rn} onChangeText={setRn} placeholder="Nombre" />
              <Campo value={rh} onChangeText={setRh} placeholder="@usuario" autoCapitalize="none" />
            </Fila>
            <Chips valor={rp} onCambio={setRp} opciones={PLATS.map((p) => [p, p] as [string, string])} />
            <Boton
              texto="Agregar"
              deshabilitado={!rn.trim()}
              style={{ alignSelf: 'flex-start' }}
              onPress={async () => {
                if (await crear('referentes', { nombre: rn.trim(), handle: rh.trim(), plataforma: rp })) {
                  setRn('');
                  setRh('');
                }
              }}
            />
          </Card>
        </View>
      </View>
    </View>
  );
}
