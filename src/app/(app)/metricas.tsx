import { useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { CampoFecha } from '@/components/CampoFecha';
import { SubirImagen } from '@/components/SubirImagen';
import { Boton, Campo, Card, Chips, Encabezado, Etiqueta, Fila, Markdown, Tenue, Texto, Titulo, Vacio } from '@/components/ui';
import { MARCA, PILARES, PK, PLATS } from '@/lib/contenido';
import { addD, fd, hoy, iso, lunes } from '@/lib/fechas';
import { leerJSON, preguntarIA } from '@/lib/ia';
import { colors, fonts, plataformaColor } from '@/lib/theme';
import type { Metrica } from '@/lib/tipos';
import { useDatos } from '@/providers/datos';

const num = (n: number | null | undefined) => (n == null ? '—' : Number(n).toLocaleString('es-CL'));
type Form = { semana: string; plataforma: string; seguidores: string; alcance: string; reproducciones: string; interacciones: string; top: string; notas: string };
const VACIO = (): Form => ({ semana: iso(lunes(hoy())), plataforma: 'Instagram', seguidores: '', alcance: '', reproducciones: '', interacciones: '', top: '', notas: '' });

export default function Metricas() {
  const { metricas, informes, ideas, crear, borrar, recargar, avisar } = useDatos();
  const [f, setF] = useState<Form>(VACIO());
  const [leyendo, setLeyendo] = useState(false);
  const [analizando, setAnalizando] = useState(false);
  const { width } = useWindowDimensions();
  const dos = width >= 1000;
  const set = (k: keyof Form, v: string) => setF((x) => ({ ...x, [k]: v }));

  const guardar = async () => {
    const n = (s: string) => (s.trim() === '' ? null : Number(s.replace(/\D/g, '')));
    const fila = { semana: f.semana, plataforma: f.plataforma, seguidores: n(f.seguidores), alcance: n(f.alcance), reproducciones: n(f.reproducciones), interacciones: n(f.interacciones), top: f.top, notas: f.notas };
    const previa = metricas.find((m) => m.semana === f.semana && m.plataforma === f.plataforma);
    if (previa) await borrar('metricas', previa.id);
    if (await crear('metricas', fila)) {
      setF(VACIO());
      avisar('Semana guardada');
    }
  };

  const leer = async (img: { data: string; media_type: string }) => {
    setLeyendo(true);
    try {
      const o = leerJSON<Record<string, string | number | null>>(
        await preguntarIA(
          'Este es un pantallazo de estadísticas de redes sociales de un creador de contenido. Extrae los números que aparezcan. Responde SOLO con JSON: {"plataforma":"Instagram|Facebook|TikTok|YouTube","seguidores":number|null,"alcance":number|null,"reproducciones":number|null,"interacciones":number|null,"top":"título o descripción del contenido con mejor desempeño, si aparece","notas":"periodo que cubre el pantallazo y cualquier dato relevante"}. Convierte abreviaciones como 12,3 mil o 1.2K en números enteros. Usa null si un dato no aparece.',
          img,
        ),
      );
      setF((x) => ({
        ...x,
        plataforma: PLATS.includes(String(o.plataforma)) ? String(o.plataforma) : x.plataforma,
        seguidores: o.seguidores != null ? String(o.seguidores) : x.seguidores,
        alcance: o.alcance != null ? String(o.alcance) : x.alcance,
        reproducciones: o.reproducciones != null ? String(o.reproducciones) : x.reproducciones,
        interacciones: o.interacciones != null ? String(o.interacciones) : x.interacciones,
        top: o.top ? String(o.top) : x.top,
        notas: o.notas ? String(o.notas) : x.notas,
      }));
      avisar('Revisa los datos y guarda');
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'No se pudo leer');
    }
    setLeyendo(false);
  };

  const informe = async () => {
    if (!metricas.length) return avisar('Primero registra al menos una semana');
    setAnalizando(true);
    const desde = iso(addD(hoy(), -35));
    const met = metricas.filter((m) => m.semana >= desde).map(({ id: _id, ...m }) => m);
    const pub = ideas
      .filter((i) => i.estado === 'publicada' && (i.fecha_publicacion ?? '') >= iso(addD(hoy(), -14)))
      .map((i) => ({ titulo: i.titulo, pilar: PILARES[i.pilar].n, formato: i.formato, fecha: i.fecha_publicacion }));
    try {
      const texto = await preguntarIA(
        `${MARCA}\n\nEres el estratega de contenido del equipo. Con estos datos, escribe el informe de cierre de semana en español chileno, breve y directo (máximo 250 palabras), en markdown simple con estas secciones: "### Cómo vamos" (crecimiento por plataforma con números y % si hay semanas para comparar), "### Qué funcionó" (relaciona con los pilares cuando se pueda), "### Qué ajustar" y "### 3 acciones para esta semana". No inventes números que no estén en los datos; si falta información, dilo.\n\nMétricas (últimas 5 semanas): ${JSON.stringify(met)}\nPublicado últimos 14 días: ${JSON.stringify(pub)}\nIdeas en cola sin publicar: ${ideas.filter((i) => i.estado !== 'publicada').length}\nPilares: ${PK.map((p) => `${PILARES[p].n} (${PILARES[p].pub})`).join('; ')}`,
      );
      await crear('informes', { texto });
      await recargar('informes');
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'No se pudo generar');
    }
    setAnalizando(false);
  };

  return (
    <View>
      <Encabezado titulo="Métricas semanales" bajada="Cada lunes: subir números (o el pantallazo) y cerrar la semana con un informe.">
        <Boton texto={analizando ? 'Analizando…' : 'Generar informe de la semana'} tipo="pri" cargando={analizando} onPress={informe} />
      </Encabezado>
      <View style={{ flexDirection: dos ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        <Card style={{ flex: dos ? 1 : undefined, width: dos ? undefined : '100%' }}>
          <Titulo tam={18}>Registrar semana</Titulo>
          <SubirImagen texto={leyendo ? 'Leyendo el pantallazo…' : '📷 Sube un pantallazo de Meta Business Suite, TikTok o YouTube Studio y la IA llena los campos'} onImagen={leer} />
          <CampoFecha etiqueta="Semana (lunes)" valor={f.semana} onCambio={(v) => set('semana', v)} />
          <Etiqueta>Plataforma</Etiqueta>
          <Chips valor={f.plataforma} onCambio={(v) => set('plataforma', v)} opciones={PLATS.map((p) => [p, p] as [string, string])} />
          <Fila wrap gap={10}>
            <Campo etiqueta="Seguidores" value={f.seguidores} onChangeText={(v) => set('seguidores', v)} keyboardType="number-pad" />
            <Campo etiqueta="Alcance" value={f.alcance} onChangeText={(v) => set('alcance', v)} keyboardType="number-pad" />
          </Fila>
          <Fila wrap gap={10}>
            <Campo etiqueta="Reproducciones" value={f.reproducciones} onChangeText={(v) => set('reproducciones', v)} keyboardType="number-pad" />
            <Campo etiqueta="Interacciones" value={f.interacciones} onChangeText={(v) => set('interacciones', v)} keyboardType="number-pad" />
          </Fila>
          <Campo etiqueta="Contenido que mejor funcionó" value={f.top} onChangeText={(v) => set('top', v)} />
          <Campo etiqueta="Notas" value={f.notas} onChangeText={(v) => set('notas', v)} />
          <Boton texto="Guardar semana" tipo="pri" onPress={guardar} style={{ alignSelf: 'flex-start' }} />
        </Card>
        <View style={{ flex: dos ? 1 : undefined, width: dos ? undefined : '100%', gap: 16 }}>
          <Card>
            <Titulo tam={18}>Seguidores por semana</Titulo>
            <Grafico M={metricas} />
          </Card>
          <Card>
            <Fila entre>
              <Titulo tam={18}>Último informe</Titulo>
              {informes[0] ? <Tenue>{fd(informes[0].fecha)}</Tenue> : null}
            </Fila>
            {informes[0] ? <Markdown texto={informes[0].texto} /> : <Tenue tam={13}>Cuando haya números de al menos una semana, el informe compara, detecta qué funcionó y propone ajustes.</Tenue>}
          </Card>
        </View>
      </View>
      <Card style={{ marginTop: 16 }}>
        <Titulo tam={18}>Historial</Titulo>
        {metricas.length ? (
          <ScrollView horizontal>
            <View style={{ minWidth: 720 }}>
              <Fila style={{ paddingVertical: 6 }}>
                {['Semana', 'Plataforma', 'Seguidores', 'Alcance', 'Reprod.', 'Interacc.', 'Top', ''].map((h, i) => (
                  <Tenue key={i} style={{ width: i === 6 ? 200 : i === 7 ? 40 : 90 }}>
                    {h}
                  </Tenue>
                ))}
              </Fila>
              {[...metricas].reverse().map((m) => (
                <Fila key={m.id} style={{ paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.linea }}>
                  <Texto style={{ width: 90 }}>{fd(m.semana)}</Texto>
                  <Texto style={{ width: 90 }}>{m.plataforma}</Texto>
                  <Texto style={{ width: 90, textAlign: 'right' }}>{num(m.seguidores)}</Texto>
                  <Texto style={{ width: 90, textAlign: 'right' }}>{num(m.alcance)}</Texto>
                  <Texto style={{ width: 90, textAlign: 'right' }}>{num(m.reproducciones)}</Texto>
                  <Texto style={{ width: 90, textAlign: 'right' }}>{num(m.interacciones)}</Texto>
                  <Tenue style={{ width: 200, paddingLeft: 10 }} lineas={1}>
                    {m.top}
                  </Tenue>
                  <Boton texto="×" chico tipo="gh" onPress={() => borrar('metricas', m.id)} />
                </Fila>
              ))}
            </View>
          </ScrollView>
        ) : (
          <Vacio>Sin registros todavía.</Vacio>
        )}
      </Card>
      {informes.length > 1 ? (
        <Card style={{ marginTop: 16 }}>
          <Titulo tam={18}>Informes anteriores</Titulo>
          {informes.slice(1, 8).map((i) => (
            <View key={i.id} style={{ borderTopWidth: 1, borderTopColor: colors.linea, paddingTop: 8 }}>
              <Texto peso="bold">{fd(i.fecha)}</Texto>
              <Markdown texto={i.texto} />
            </View>
          ))}
        </Card>
      ) : null}
    </View>
  );
}

function Grafico({ M }: { M: Metrica[] }) {
  const sems = [...new Set(M.map((m) => m.semana))].sort().slice(-12);
  const vals = M.filter((m) => sems.includes(m.semana) && m.seguidores != null).map((m) => Number(m.seguidores));
  if (!vals.length) return <Vacio>El gráfico aparece con el primer registro de seguidores.</Vacio>;
  const W = 520, H = 200, P = { l: 56, r: 12, t: 12, b: 26 };
  let mn = Math.min(...vals), mx = Math.max(...vals);
  if (mn === mx) { mn *= 0.95; mx = mx * 1.05 || 1; }
  const x = (i: number) => P.l + (sems.length === 1 ? (W - P.l - P.r) / 2 : (i * (W - P.l - P.r)) / (sems.length - 1));
  const y = (v: number) => P.t + (1 - (v - mn) / (mx - mn)) * (H - P.t - P.b);
  const lineas = PLATS.map((p) => ({
    p,
    pts: sems.map((k, i) => { const m = M.find((z) => z.semana === k && z.plataforma === p); return m && m.seguidores != null ? { x: x(i), y: y(Number(m.seguidores)), v: Number(m.seguidores) } : null; }).filter(Boolean) as { x: number; y: number; v: number }[],
  })).filter((l) => l.pts.length);
  return (
    <View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        {[mn, (mn + mx) / 2, mx].map((t, i) => (
          <Line key={i} x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke={colors.linea} />
        ))}
        {[mn, (mn + mx) / 2, mx].map((t, i) => (
          <SvgText key={'t' + i} x={P.l - 6} y={y(t) + 4} fill={colors.tenue} fontSize={10} textAnchor="end" fontFamily={fonts.texto}>
            {Math.round(t).toLocaleString('es-CL')}
          </SvgText>
        ))}
        {sems.map((k, i) => (sems.length <= 6 || i % 2 === 0 ? <SvgText key={k} x={x(i)} y={H - 8} fill={colors.tenue} fontSize={10} textAnchor="middle" fontFamily={fonts.texto}>{fd(k)}</SvgText> : null))}
        {lineas.map((l) => (
          <Polyline key={l.p} points={l.pts.map((q) => `${q.x},${q.y}`).join(' ')} fill="none" stroke={plataformaColor[l.p]} strokeWidth={2} />
        ))}
        {lineas.flatMap((l) => l.pts.map((q, i) => <Circle key={l.p + i} cx={q.x} cy={q.y} r={3.5} fill={plataformaColor[l.p]} />))}
      </Svg>
      <Fila gap={12} wrap>
        {lineas.map((l) => (
          <Fila key={l.p} gap={5}>
            <View style={{ width: 10, height: 3, backgroundColor: plataformaColor[l.p] }} />
            <Tenue>{l.p}</Tenue>
          </Fila>
        ))}
      </Fila>
    </View>
  );
}
