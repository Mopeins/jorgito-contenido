import { useState } from 'react';
import { Linking, useWindowDimensions, View } from 'react-native';

import { Boton, Campo, Card, Chips, Encabezado, Fila, Pill, Tag, Tenue, Texto, Titulo, Vacio } from '@/components/ui';
import { PLATS, PLATS_RADAR, platRadar } from '@/lib/contenido';
import { fd } from '@/lib/fechas';
import { promptRadar } from '@/lib/ia';
import { colors, pilarColor, plataformaColor } from '@/lib/theme';
import type { Hallazgo, Pilar } from '@/lib/tipos';
import { usePedir } from '@/components/Cola';
import { RadarHooks } from '@/components/Hooks';
import { useDatos } from '@/providers/datos';

export default function Radar() {
  const { radar, referentes, crear, editar, borrar, solicitudes, hooks } = useDatos();
  const pedir = usePedir();
  const [vista, setVista] = useState<'hallazgos' | 'hooks'>('hallazgos');
  const [f, setF] = useState<'nuevo' | 'usado' | 'descartado' | 'todos'>('nuevo');
  const [ref, setRef] = useState('');
  const [plat, setPlat] = useState('Instagram');
  const [fp, setFp] = useState('todas');
  const [link, setLink] = useState('');
  const [resumen, setResumen] = useState('');
  const [rn, setRn] = useState('');
  const [rh, setRh] = useState('');
  const [rp, setRp] = useState('Instagram');
  const [ocupado, setOcupado] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const dos = width >= 1000;
  const porEstado = radar.filter((r) => f === 'todos' || r.estado === f);
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
        <Chips valor={vista} onCambio={setVista} opciones={[['hallazgos', `Hallazgos (${radar.filter((r) => r.estado === 'nuevo').length} nuevos)`], ['hooks', `Hooks (${hooks.length})`]]} />
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
          {!lista.length ? <Vacio>Sin hallazgos en esta lista. El radar diario deja aquí lo que encuentre cada mañana; también pueden pegar uno a mano.</Vacio> : null}
        </View>
        <View style={{ flex: dos ? 1 : undefined, width: dos ? undefined : '100%', gap: 16 }}>
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
      )}
    </View>
  );
}
