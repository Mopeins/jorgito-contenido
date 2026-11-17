import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Boton, Campo, Card, Chips, ChipsMulti, Encabezado, Etiqueta, Fila, Pill, Tag, Tenue, Texto, Titulo, Vacio } from '@/components/ui';
import { FORMATOS, PILARES, PK } from '@/lib/contenido';
import { addD, eventos, fd, hoy } from '@/lib/fechas';
import { aFilaIdea, leerJSON, preguntarIA, promptDiaD, promptMundial, promptPilar, type IdeaIA } from '@/lib/ia';
import { colors, pilarColor } from '@/lib/theme';
import type { Pilar } from '@/lib/tipos';
import { useDatos } from '@/providers/datos';

type Modo = 'pilar' | 'diad' | 'mundial';
const PAISES = ['Chile', 'Argentina', 'Brasil', 'Paraguay', 'Uruguay', 'EE.UU.', 'Colombia', 'Australia', 'Perú', 'Venezuela', 'México', 'España'];

type Params = { modo?: Modo; pilar?: Pilar; tema?: string; evento?: string; fecha?: string };

/** Si llegan parámetros nuevos (desde una fecha o un pilar), el formulario parte de cero con ellos */
export default function Generador() {
  const q = useLocalSearchParams<Params>();
  return <Formulario key={[q.modo, q.pilar, q.tema, q.evento, q.fecha].join('|')} q={q} />;
}

function Formulario({ q }: { q: Params }) {
  const { fechas, crear, avisar } = useDatos();
  const router = useRouter();
  const [modo, setModo] = useState<Modo>(q.modo ?? 'pilar');
  const [pilar, setPilar] = useState<Pilar>(q.pilar ?? 'recetas');
  const [formato, setFormato] = useState(FORMATOS[0]);
  const [n, setN] = useState('4');
  const [tema, setTema] = useState(q.tema ?? '');
  const prox = eventos(hoy(), addD(hoy(), 120), fechas);
  const [evento, setEvento] = useState<string>(q.evento ? `${q.evento}|${q.fecha ?? ''}` : prox[0] ? `${prox[0].n}|${prox[0].date}` : 'otro');
  const [extra, setExtra] = useState('');
  const [tm, setTm] = useState('Carnes: el mismo corte a la parrilla de distintos países');
  const [paises, setPaises] = useState(PAISES.slice(0, 8));
  const [pensando, setPensando] = useState(false);
  const [out, setOut] = useState<{ serie?: string; descripcion?: string; ideas: (IdeaIA & { _id?: string })[]; ev?: [string, string | null] } | null>(null);
  const [error, setError] = useState('');


  const generar = async () => {
    setPensando(true);
    setError('');
    setOut(null);
    try {
      let prompt = '';
      let ev: [string, string | null] | undefined;
      if (modo === 'pilar') prompt = promptPilar(pilar, tema, formato, Number(n));
      else if (modo === 'diad') {
        if (evento === 'otro') {
          if (!extra.trim()) throw new Error('Escribe la fecha a celebrar');
          prompt = promptDiaD(extra, null, '');
          ev = [extra, null];
        } else {
          const [nombre, f] = evento.split('|');
          prompt = promptDiaD(nombre, f || null, extra);
          ev = [nombre, f || null];
        }
      } else {
        if (paises.length < 2) throw new Error('Elige al menos 2 países');
        prompt = promptMundial(tm, paises);
      }
      const r = leerJSON<{ serie?: string; descripcion?: string; ideas: IdeaIA[] }>(await preguntarIA(prompt));
      setOut({ ...r, ideas: (r.ideas ?? []).map((x) => ({ ...x, pilar: PILARES[x.pilar] ? x.pilar : modo === 'mundial' ? 'versus' : pilar })), ev });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo generar');
    }
    setPensando(false);
  };

  const guardar = async (ix: number) => {
    if (!out) return;
    const x = out.ideas[ix];
    const fila = await crear<{ id: string }>(
      'ideas',
      aFilaIdea(x, { evento: out.ev?.[0], fecha: out.ev?.[1], origen: out.serie ? 'Mundial: ' + out.serie : 'Generador IA' }),
    );
    if (fila) {
      setOut((o) => (o ? { ...o, ideas: o.ideas.map((y, j) => (j === ix ? { ...y, _id: fila.id } : y)) } : o));
      avisar('Guardada en el tablero');
    }
  };

  return (
    <View>
      <Encabezado titulo="Generador de ideas" bajada="La IA propone; ustedes eligen y guardan en el tablero. Cada idea guardada nace con su flujo de trabajo." />
      <View style={{ marginBottom: 14 }}>
        <Chips valor={modo} onCambio={(m) => { setModo(m); setOut(null); }} opciones={[['pilar', 'Por pilar'], ['diad', 'Día D · 3 piezas'], ['mundial', 'Mundial (llaves)']]} />
      </View>
      <Card>
        {modo === 'pilar' ? (
          <>
            <Etiqueta>Pilar</Etiqueta>
            <Chips valor={pilar} onCambio={setPilar} opciones={PK.map((k) => [k, PILARES[k].n] as [Pilar, string])} />
            <Etiqueta>Formato</Etiqueta>
            <Chips valor={formato} onCambio={setFormato} opciones={FORMATOS.map((f) => [f, f] as [string, string])} />
            <Etiqueta>Cantidad</Etiqueta>
            <Chips valor={n} onCambio={setN} opciones={[['3', '3'], ['4', '4'], ['6', '6']]} />
            <Campo etiqueta="Tema o punto de partida" value={tema} onChangeText={setTema} placeholder="Ej: la comida favorita de los Avengers, un tip viral de Nick DiGiovanni…" />
          </>
        ) : null}
        {modo === 'diad' ? (
          <>
            <Etiqueta>Fecha (próximos 4 meses)</Etiqueta>
            <Chips
              valor={evento}
              onCambio={setEvento}
              opciones={[...prox.filter((e) => e.tipo === 'efe').slice(0, 18).map((e) => [`${e.n}|${e.date}`, `${fd(e.date)} · ${e.n}`] as [string, string]), ...(q.evento && !prox.some((e) => e.n === q.evento) ? [[`${q.evento}|${q.fecha ?? ''}`, q.evento] as [string, string]] : []), ['otro', 'Otra…']]}
            />
            <Campo etiqueta={evento === 'otro' ? 'Fecha a celebrar' : 'Detalle extra (opcional)'} value={extra} onChangeText={setExtra} placeholder={evento === 'otro' ? 'Ej: Día del Queso' : 'Ej: usar queso mantecoso; incluir challenge'} />
            <Tenue tam={13}>Genera 3 piezas de la misma fecha: una receta, un truco o challenge y un enfrentamiento.</Tenue>
          </>
        ) : null}
        {modo === 'mundial' ? (
          <>
            <Campo etiqueta="¿Qué compite?" value={tm} onChangeText={setTm} />
            <Etiqueta>Países (8 para cuartos de final)</Etiqueta>
            <ChipsMulti opciones={PAISES} valor={paises} onCambio={setPaises} />
            <Tenue tam={13}>Arma los cruces dejando las rivalidades más fuertes para la final (Chile–Argentina, Chile–Perú) y un video por partido.</Tenue>
          </>
        ) : null}
        <Fila>
          <Boton texto={pensando ? 'Generando…' : 'Generar'} tipo="pri" onPress={generar} cargando={pensando} />
          {error ? <Texto color={colors.rojo}>{error}</Texto> : null}
        </Fila>
      </Card>

      {out ? (
        <View style={{ gap: 12, marginTop: 16 }}>
          {out.serie ? (
            <Card>
              <Titulo tam={18}>{out.serie}</Titulo>
              <Tenue tam={13}>{out.descripcion}</Tenue>
              <Boton
                texto={`Guardar los ${out.ideas.length} partidos en el tablero`}
                tipo="pri"
                style={{ alignSelf: 'flex-start' }}
                onPress={async () => {
                  for (let i = 0; i < out.ideas.length; i++) if (!out.ideas[i]._id) await guardar(i);
                }}
              />
            </Card>
          ) : null}
          {out.ideas.map((x, ix) => (
            <View key={ix} style={{ backgroundColor: colors.s2, borderWidth: 1, borderColor: colors.linea, borderLeftWidth: 3, borderLeftColor: pilarColor[x.pilar], borderRadius: 12, padding: 16, gap: 8 }}>
              <Fila entre wrap>
                <Fila gap={6} wrap>
                  <Pill pilar={x.pilar} />
                  {x.formato ? <Tag texto={x.formato} /> : null}
                  {x.ronda ? <Tag texto={x.ronda} /> : null}
                </Fila>
                {x._id ? (
                  <Boton texto="Abrir ficha →" chico onPress={() => router.push(`/idea/${x._id}` as never)} />
                ) : (
                  <Boton texto="Guardar en tablero" chico tipo="pri" onPress={() => guardar(ix)} />
                )}
              </Fila>
              <Titulo tam={16}>{x.titulo}</Titulo>
              {x.gancho ? <Bloque k="Gancho" v={x.gancho} /> : null}
              {Array.isArray(x.guion) && x.guion.length ? <Bloque k="Guion" v={x.guion.map((g, i) => `${i + 1}. ${g}`).join('\n')} /> : null}
              {x.cta ? <Bloque k="Cierre" v={x.cta} /> : null}
              {x.votacion ? <Bloque k="Votación" v={x.votacion} /> : null}
              {x.insumos ? <Tenue tam={13}>Insumos: {x.insumos}</Tenue> : null}
              {x.por_que ? <Tenue tam={13}>Por qué funciona: {x.por_que}</Tenue> : null}
            </View>
          ))}
          {!out.ideas.length ? <Vacio>La IA no devolvió ideas. Intenta de nuevo.</Vacio> : null}
        </View>
      ) : null}
    </View>
  );
}

function Bloque({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Texto tam={11} peso="bold" color={colors.tenue} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {k}
      </Texto>
      <Texto>{v}</Texto>
    </View>
  );
}
