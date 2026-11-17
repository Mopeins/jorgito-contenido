import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ColaPedidos, usePedir } from '@/components/Cola';
import { Boton, Campo, Card, Chips, ChipsMulti, Encabezado, Etiqueta, Fila, Tenue, Texto } from '@/components/ui';
import { FORMATOS, PILARES, PK } from '@/lib/contenido';
import { addD, eventos, fd, hoy } from '@/lib/fechas';
import { HORARIO_COLA, promptDiaD, promptMundial, promptPilar, type Pedido } from '@/lib/ia';
import { colors } from '@/lib/theme';
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
  const { fechas } = useDatos();
  const pedir = usePedir();
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
  const [error, setError] = useState('');


  const generar = async () => {
    setError('');
    let pedido: Pedido;
    if (modo === 'pilar') {
      pedido = { tipo: 'ideas', titulo: `${n} ideas de ${PILARES[pilar].n}${tema ? ': ' + tema : ''}`, prompt: promptPilar(pilar, tema, formato, Number(n)), destino: { origen: 'Claude · generador' } };
    } else if (modo === 'diad') {
      if (evento === 'otro') {
        if (!extra.trim()) return setError('Escribe la fecha a celebrar');
        pedido = { tipo: 'ideas', titulo: `Día D: ${extra}`, prompt: promptDiaD(extra, null, ''), destino: { evento: extra, origen: 'Claude · Día D' } };
      } else {
        const [nombre, f] = evento.split('|');
        pedido = { tipo: 'ideas', titulo: `Día D: ${nombre}`, prompt: promptDiaD(nombre, f || null, extra), destino: { evento: nombre, fecha: f || null, origen: 'Claude · Día D' } };
      }
    } else {
      if (paises.length < 2) return setError('Elige al menos 2 países');
      pedido = { tipo: 'ideas', titulo: `Mundial: ${tm}`, prompt: promptMundial(tm, paises), destino: { origen: 'Claude · Mundial' } };
    }
    setPensando(true);
    if (await pedir(pedido)) {
      setTema('');
      setExtra('');
    }
    setPensando(false);
  };

  return (
    <View>
      <Encabezado titulo="Generador de ideas" bajada="Pídele ideas a Claude: llegan solas al tablero, cada una con su flujo de trabajo, y ahí deciden cuáles siguen." />
      <View style={{ marginBottom: 14 }}>
        <Chips valor={modo} onCambio={setModo} opciones={[['pilar', 'Por pilar'], ['diad', 'Día D · 3 piezas'], ['mundial', 'Mundial (llaves)']]} />
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
        <Fila wrap>
          <Boton texto="Pedir a Claude" tipo="pri" onPress={generar} cargando={pensando} />
          {error ? <Texto color={colors.rojo}>{error}</Texto> : <Tenue>Las ideas llegan al tablero {HORARIO_COLA}.</Tenue>}
        </Fila>
      </Card>
      <View style={{ marginTop: 16 }}>
        <ColaPedidos filtro={(x) => x.tipo === 'ideas'} />
      </View>
    </View>
  );
}
