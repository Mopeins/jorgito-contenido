import { useState } from 'react';
import { Linking, useWindowDimensions, View } from 'react-native';

import { Boton, Campo, Card, Chips, Encabezado, Fila, Pill, Tag, Tenue, Texto, Titulo, Vacio } from '@/components/ui';
import { enLaSemana, PLATS, PLATS_RADAR, platRadar, sitio } from '@/lib/contenido';
import { fd } from '@/lib/fechas';
import { promptRadar } from '@/lib/ia';
import { colors, pilarColor, plataformaColor } from '@/lib/theme';
import type { Hallazgo, Pilar } from '@/lib/tipos';
import { usePedir } from '@/components/Cola';
import { RadarHooks } from '@/components/Hooks';
import { useDatos } from '@/providers/datos';

const vistasCortas = (n: number | null) => {
  if (n == null) return '?';
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e8 ? 0 : 1).replace('.', ',').replace(/,0$/, '') + 'M';
  if (n >= 1e3) return Math.round(n / 1e3) + 'K';
  return String(n);
};

export default function Radar() {
  const { radar, referentes, crear, editar, borrar, solicitudes, hooks, shorts } = useDatos();
  const [abierto, setAbierto] = useState<string | null>(null);
  const pedir = usePedir();
  const [vista, setVista] = useState<'hallazgos' | 'hooks'>('hallazgos');
  const [f, setF] = useState<'nuevo' | 'usado' | 'descartado' | 'todos'>('nuevo');
  const [ref, setRef] = useState('');
  const [plat, setPlat] = useState('Instagram');
  const [fp, setFp] = useState('todas');
  const [periodo, setPeriodo] = useState<'semana' | 'todo'>('semana');
  const [link, setLink] = useState('');
  const [resumen, setResumen] = useState('');
  const [rn, setRn] = useState('');
  const [rh, setRh] = useState('');
  const [rp, setRp] = useState('Instagram');
  const [ocupado, setOcupado] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const dos = width >= 1000;
  const porEstado = radar.filter((r) => (f === 'todos' || r.estado === f) && (periodo === 'todo' || enLaSemana(r.fecha)));
  const lista = porEstado.filter((r) => fp === 'todas' || platRadar(r.plataforma) === fp);
  const cuenta = (p: string) => porEstado.filter((r) => platRadar(r.plataforma) === p).length;

  const enCola = (id: string) => solicitudes.some((x) => x.tipo === 'radar' && x.destino?.radar_id === id && (x.estado === 'pendiente' || x.estado === 'procesando'));
  const convertir = async (r: Hallazgo) => {
    setOcupado(r.id);
    await pedir({
      tipo: 'radar',
      titulo: `Ideas desde el radar: ${r.referente || 'hallazgo'}`,
      prompt: promptRadar(r.resumen, r.referente, r.plataforma, r.oportunidad),
      destino: { radar_id: r.id, origen: 'Radar: ' + (r.referente || ''), referencia: `${r.resumen}${r.link ? '\n' + r.link : ''}` },
    });
    setOcupado(null);
  };

  return (
    <View>
      <Encabezado titulo="Radar" bajada="Qué están haciendo los referentes, a qué se puede responder y qué ganchos están funcionando. Se actualiza solo cada mañana." />
      <View style={{ marginBottom: 14 }}>
        <Chips valor={vista} onCambio={setVista} opciones={[['hallazgos', `Hallazgos (${radar.filter((r) => r.estado === 'nuevo' && enLaSemana(r.fecha)).length} nuevos esta semana)`], ['hooks', `Hooks (${hooks.length})`]]} />
      </View>
      {vista === 'hooks' ? <RadarHooks ancho={dos} /> : (
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
          <Chips valor={periodo} onCambio={setPeriodo} opciones={[['semana', 'Última semana (hoy y 7 días atrás)'], ['todo', 'Todo el historial']]} />
          <Chips
            valor={fp}
            onCambio={setFp}
            opciones={[['todas', `Todas las plataformas (${porEstado.length})`] as [string, string], ...PLATS_RADAR.map((p) => [p, `${p} (${cuenta(p)})`] as [string, string])]}
          />
          {lista.map((r) => (
            <Card key={r.id} style={{ borderLeftWidth: 3, borderLeftColor: pilarColor[r.pilar as Pilar] ?? pilarColor.tendencias }}>
              <Fila entre wrap>
                <Fila gap={6} wrap>
                  <Texto peso="bold">{r.referente || 'Hallazgo'}</Texto>
                  <Tag texto={platRadar(r.plataforma)} color={plataformaColor[platRadar(r.plataforma)]} />
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
              {/^https?:\/\//.test(r.link) || (r.ejemplos ?? []).length ? (
                <View style={{ gap: 4 }}>
                  {/^https?:\/\//.test(r.link) ? (
                    <Texto tam={13} color={colors.brasa2} onPress={() => Linking.openURL(r.link)} lineas={1}>
                      Fuente: {sitio(r.link)} ↗
                    </Texto>
                  ) : null}
                  {(r.ejemplos ?? []).filter((e) => /^https?:\/\//.test(e)).map((e, k) => (
                    <Texto key={e} tam={13} color={colors.brasa2} onPress={() => Linking.openURL(e)} lineas={1}>
                      Ejemplo {k + 1}: {sitio(e)} ↗
                    </Texto>
                  ))}
                </View>
              ) : null}
              <Fila wrap>
                {/^https?:\/\//.test(r.link) ? <Boton texto="Ver original" chico onPress={() => Linking.openURL(r.link)} /> : null}
                {r.estado === 'nuevo' ? (
                  <>
                    {enCola(r.id) ? <Tag texto="En cola para Claude" aviso /> : <Boton texto="Pedir ideas a Claude" chico tipo="pri" cargando={ocupado === r.id} onPress={() => convertir(r)} />}
                    <Boton texto="Descartar" chico tipo="gh" onPress={() => editar('radar', r.id, { estado: 'descartado' })} />
                  </>
                ) : (
                  <Boton texto="Volver a nuevos" chico tipo="gh" onPress={() => editar('radar', r.id, { estado: 'nuevo' })} />
                )}
              </Fila>
            </Card>
          ))}
          {!lista.length ? <Vacio>{periodo === 'semana' ? 'Nada en los últimos 7 días con estos filtros. Prueba con «Todo el historial».' : 'Sin hallazgos en esta lista.'} El radar diario deja aquí lo que encuentre cada mañana; también pueden pegar uno a mano.</Vacio> : null}
        </View>
        <View style={{ flex: dos ? 1 : undefined, width: dos ? undefined : '100%', gap: 16 }}>
          <Card style={{ borderLeftWidth: 3, borderLeftColor: colors.brasa }}>
            <Titulo tam={18}>Cómo trabaja el radar</Titulo>
            {[
              ['Cuándo', 'Todas las mañanas a las 7:39. Por defecto ves lo de hoy y los 7 días anteriores.'],
              ['Referentes', 'Revisa lo que publicaron en los últimos 3 días en Instagram, Facebook, TikTok, YouTube Shorts, YouTube largo y la web.'],
              ['Tendencias', 'Solo entran si tienen 1 millón de visualizaciones o más, comprobado con un video o una fuente. Noticias, eventos o lanzamientos sin vistas no cuentan.'],
              ['Hooks', 'Ganchos que funcionaron durante toda la última semana, adaptados al español chileno.'],
              ['Links', 'Cada hallazgo trae la fuente donde se confirmó y, cuando existen, videos de ejemplo.'],
              ['Ojo', 'Instagram y Facebook casi no se pueden revisar de forma automática. Si ven un reel bueno, péguenlo abajo.'],
            ].map(([t, d]) => (
              <Texto key={t} tam={13} color={colors.tenue}>
                <Texto tam={13} peso="bold">
                  {t}:{' '}
                </Texto>
                {d}
              </Texto>
            ))}
          </Card>
          <Card>
            <Titulo tam={18}>Pegar un hallazgo</Titulo>
            <Campo etiqueta="Quién" value={ref} onChangeText={setRef} placeholder="Ej: Nick DiGiovanni" />
            <Chips valor={plat} onCambio={setPlat} opciones={PLATS_RADAR.map((p) => [p, p] as [string, string])} />
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
            <Tenue>Toca «Top Shorts» para ver los 15 Shorts de YouTube más vistos de cada uno. Se actualiza solo cada lunes.</Tenue>
            {referentes.map((r) => {
              const suyos = shorts.filter((x) => x.referente === r.nombre).sort((a, b) => a.posicion - b.posicion);
              const ab = abierto === r.id;
              return (
                <View key={r.id} style={{ borderTopWidth: 1, borderTopColor: colors.linea, paddingTop: 8, gap: 8 }}>
                  <Fila entre>
                    <View style={{ flexShrink: 1 }}>
                      <Texto peso="bold">{r.nombre}</Texto>
                      <Tenue>
                        {r.handle} {r.plataforma}
                      </Tenue>
                    </View>
                    <Fila gap={4}>
                      {suyos.length ? <Boton texto={ab ? 'Cerrar' : `Top Shorts (${suyos.length})`} chico onPress={() => setAbierto(ab ? null : r.id)} /> : null}
                      <Boton texto="Quitar" chico tipo="gh" onPress={() => borrar('referentes', r.id)} />
                    </Fila>
                  </Fila>
                  {ab ? (
                    <View style={{ gap: 6, paddingLeft: 4 }}>
                      {suyos.map((x) => (
                        <View key={x.id} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                          <Texto tam={13} peso="bold" color={colors.brasa} style={{ width: 22 }}>
                            {x.posicion}
                          </Texto>
                          <View style={{ flex: 1, gap: 2 }}>
                            <Texto tam={13} color={/^https?:\/\//.test(x.link) ? colors.brasa2 : colors.tinta} onPress={/^https?:\/\//.test(x.link) ? () => Linking.openURL(x.link) : undefined}>
                              {x.titulo}
                              {/^https?:\/\//.test(x.link) ? ' ↗' : ''}
                            </Texto>
                            <Fila gap={6} wrap>
                              <Tag texto={`${vistasCortas(x.vistas)} vistas`} color={colors.tinta} />
                              {x.fecha ? <Tenue tam={11}>{fd(x.fecha)}{x.fecha.slice(0, 4) !== String(new Date().getFullYear()) ? ' ' + x.fecha.slice(0, 4) : ''}</Tenue> : null}
                              {x.alcance === 'reciente' ? <Tag texto="de los últimos meses" /> : null}
                              {!x.confirmado ? <Tag texto="Short sin confirmar" aviso /> : null}
                            </Fila>
                          </View>
                        </View>
                      ))}
                      <Tenue tam={11}>Actualizado el {fd(suyos[0].actualizado)}. «De los últimos meses»: no se pudo ver su histórico completo, así que ese puesto sale de sus subidas recientes.</Tenue>
                    </View>
                  ) : null}
                </View>
              );
            })}
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
      )}
    </View>
  );
}
