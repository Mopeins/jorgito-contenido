import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { CampoFecha } from '@/components/CampoFecha';
import { Boton, Campo, Card, Chips, ChipsMulti, Etiqueta, Fila, Pill, Tag, Tenue, Texto, Titulo, Vacio } from '@/components/ui';
import { ESTADOS, FORMATOS, PILARES, PK, PLATS, TIPOS_PROPUESTA } from '@/lib/contenido';
import { fd } from '@/lib/fechas';
import { esTipoPropuesta, leerJSON, preguntarIA, promptPropuestas } from '@/lib/ia';
import { colors, pilarColor } from '@/lib/theme';
import type { Estado, Idea, Pilar, Propuesta, TipoPropuesta } from '@/lib/tipos';
import { useDatos } from '@/providers/datos';
import { useSesion } from '@/providers/sesion';

type Borrador = Pick<Idea, 'titulo' | 'pilar' | 'formato' | 'estado' | 'fecha_grabacion' | 'fecha_publicacion' | 'plataformas' | 'gancho' | 'guion' | 'cta' | 'notas'>;

export default function FichaIdea() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ideas, pasos, propuestas, editar, borrar } = useDatos();
  const router = useRouter();
  const idea = ideas.find((i) => i.id === id);
  const { width } = useWindowDimensions();
  const dos = width >= 1100;

  if (!idea)
    return (
      <View style={{ gap: 12 }}>
        <Vacio>Esta idea no existe o fue borrada.</Vacio>
        <Boton texto="← Volver al tablero" onPress={() => router.navigate('/ideas' as never)} />
      </View>
    );

  const misPasos = pasos.filter((p) => p.idea_id === idea.id).sort((a, b) => a.orden - b.orden);
  const misProps = propuestas.filter((p) => p.idea_id === idea.id);

  return (
    <View>
      <Fila entre wrap style={{ marginBottom: 18 }}>
        <Boton texto="← Tablero" tipo="gh" onPress={() => router.navigate('/ideas' as never)} />
        <Fila gap={6} wrap>
          <Pill pilar={idea.pilar} />
          <Tag texto={ESTADOS.find((e) => e[0] === idea.estado)?.[1] ?? ''} />
          {idea.evento ? <Tag texto={idea.evento} /> : null}
          {idea.origen ? <Tag texto={idea.origen} /> : null}
        </Fila>
      </Fila>
      <View style={{ flexDirection: dos ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        <View style={{ flex: dos ? 1.2 : undefined, width: dos ? undefined : '100%', gap: 16 }}>
          <FormIdea
            key={idea.id + idea.editado}
            idea={idea}
            guardar={(b) => editar('ideas', idea.id, b)}
            borrar={async () => {
              if (await borrar('ideas', idea.id)) router.navigate('/ideas' as never);
            }}
          />
        </View>
        <View style={{ flex: dos ? 1 : undefined, width: dos ? undefined : '100%', gap: 16 }}>
          <Flujo ideaId={idea.id} pasos={misPasos} color={pilarColor[idea.pilar]} />
          <Propuestas idea={idea} props={misProps} />
        </View>
      </View>
    </View>
  );
}

/* ---------------- Datos de la idea ---------------- */
function FormIdea({ idea, guardar, borrar }: { idea: Idea; guardar: (b: Borrador) => Promise<boolean>; borrar: () => void }) {
  const inicial: Borrador = {
    titulo: idea.titulo,
    pilar: idea.pilar,
    formato: idea.formato,
    estado: idea.estado,
    fecha_grabacion: idea.fecha_grabacion,
    fecha_publicacion: idea.fecha_publicacion,
    plataformas: idea.plataformas ?? [],
    gancho: idea.gancho ?? '',
    guion: idea.guion ?? '',
    cta: idea.cta ?? '',
    notas: idea.notas ?? '',
  };
  const [b, setB] = useState<Borrador>(inicial);
  const [guardando, setGuardando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const cambio = JSON.stringify(b) !== JSON.stringify(inicial);
  const set = <K extends keyof Borrador>(k: K, v: Borrador[K]) => setB((x) => ({ ...x, [k]: v }));

  return (
    <Card>
      <Campo value={b.titulo} onChangeText={(v) => set('titulo', v)} style={{ fontSize: 20, fontFamily: 'BricolageGrotesque_700Bold' }} />
      <Etiqueta>Pilar</Etiqueta>
      <Chips valor={b.pilar} onCambio={(v) => set('pilar', v)} opciones={PK.map((k) => [k, PILARES[k].n] as [Pilar, string])} />
      <Etiqueta>Estado</Etiqueta>
      <Chips valor={b.estado} onCambio={(v) => set('estado', v as Estado)} opciones={ESTADOS} />
      <Etiqueta>Formato</Etiqueta>
      <Chips valor={b.formato ?? ''} onCambio={(v) => set('formato', v)} opciones={FORMATOS.map((f) => [f, f] as [string, string])} />
      <Fila gap={12} wrap>
        <CampoFecha etiqueta="Fecha de grabación" valor={b.fecha_grabacion ?? ''} onCambio={(v) => set('fecha_grabacion', v || null)} />
        <CampoFecha etiqueta="Fecha de publicación" valor={b.fecha_publicacion ?? ''} onCambio={(v) => set('fecha_publicacion', v || null)} />
      </Fila>
      <Etiqueta>Plataformas</Etiqueta>
      <ChipsMulti opciones={PLATS} valor={b.plataformas} onCambio={(v) => set('plataformas', v)} />
      <Campo etiqueta="Gancho (primeros 3 segundos)" value={b.gancho} onChangeText={(v) => set('gancho', v)} />
      <Campo etiqueta="Guion / pasos" value={b.guion} onChangeText={(v) => set('guion', v)} multiline style={{ minHeight: 150 }} />
      <Campo etiqueta="Cierre y llamado a la acción (votación por plataforma si aplica)" value={b.cta} onChangeText={(v) => set('cta', v)} multiline />
      <Campo etiqueta="Notas, insumos, referencias" value={b.notas} onChangeText={(v) => set('notas', v)} multiline />
      <Fila entre>
        {confirmar ? (
          <Fila>
            <Boton texto="Sí, borrar" tipo="peligro" chico onPress={borrar} />
            <Boton texto="No" tipo="gh" chico onPress={() => setConfirmar(false)} />
          </Fila>
        ) : (
          <Boton texto="Borrar idea" tipo="gh" chico onPress={() => setConfirmar(true)} />
        )}
        <Fila>
          {cambio ? <Tenue>Cambios sin guardar</Tenue> : null}
          <Boton
            texto="Guardar"
            tipo="pri"
            deshabilitado={!cambio || !b.titulo.trim()}
            cargando={guardando}
            onPress={async () => {
              setGuardando(true);
              await guardar(b);
              setGuardando(false);
            }}
          />
        </Fila>
      </Fila>
    </Card>
  );
}

/* ---------------- Flujo de trabajo ---------------- */
function Flujo({ ideaId, pasos, color }: { ideaId: string; pasos: import('@/lib/tipos').Paso[]; color: string }) {
  const { crear, editar, borrar, equipo } = useDatos();
  const { email } = useSesion();
  const [nuevo, setNuevo] = useState('');
  const [abierto, setAbierto] = useState<string | null>(null);
  const hechos = pasos.filter((p) => p.hecho).length;
  const personas = useMemo(() => equipo.map((m) => m.nombre || m.email.split('@')[0]), [equipo]);

  const agregar = async () => {
    if (!nuevo.trim()) return;
    await crear('pasos', { idea_id: ideaId, titulo: nuevo.trim(), orden: (pasos.at(-1)?.orden ?? 0) + 1 });
    setNuevo('');
  };
  const marcar = (p: (typeof pasos)[number]) =>
    editar('pasos', p.id, p.hecho ? { hecho: false, hecho_por: '', hecho_en: null } : { hecho: true, hecho_por: email, hecho_en: new Date().toISOString() });

  return (
    <Card>
      <Fila entre>
        <Titulo tam={18}>Flujo de trabajo</Titulo>
        <Tenue>
          {hechos}/{pasos.length} listos
        </Tenue>
      </Fila>
      <View style={{ height: 5, backgroundColor: colors.s3, borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ height: 5, width: `${pasos.length ? (hechos / pasos.length) * 100 : 0}%`, backgroundColor: color }} />
      </View>
      {pasos.map((p) => (
        <View key={p.id} style={{ borderTopWidth: 1, borderTopColor: colors.linea, paddingTop: 8, gap: 6 }}>
          <Fila gap={10}>
            <Pressable
              onPress={() => marcar(p)}
              style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: p.hecho ? color : colors.tenue2, backgroundColor: p.hecho ? color : 'transparent', alignItems: 'center', justifyContent: 'center' }}
            >
              {p.hecho ? (
                <Texto tam={13} peso="bold" color={colors.sobreBrasa}>
                  ✓
                </Texto>
              ) : null}
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => setAbierto(abierto === p.id ? null : p.id)}>
              <Texto color={p.hecho ? colors.tenue : colors.tinta} style={p.hecho ? { textDecorationLine: 'line-through' } : undefined}>
                {p.titulo}
              </Texto>
              <Fila gap={6} wrap>
                {p.responsable ? <Tag texto={'👤 ' + p.responsable} /> : null}
                {p.fecha ? <Tag texto={'📅 ' + fd(p.fecha)} /> : null}
                {p.hecho && p.hecho_por ? <Tenue tam={11}>hecho por {p.hecho_por.split('@')[0]}</Tenue> : null}
              </Fila>
            </Pressable>
          </Fila>
          {abierto === p.id ? (
            <View style={{ gap: 8, paddingLeft: 32, paddingBottom: 6 }}>
              <Etiqueta>Responsable</Etiqueta>
              <Chips valor={p.responsable} onCambio={(v) => editar('pasos', p.id, { responsable: v === p.responsable ? '' : v })} opciones={[...personas, 'Jorgito'].map((x) => [x, x] as [string, string])} />
              <Fila wrap>
                <CampoFecha etiqueta="Fecha límite" valor={p.fecha ?? ''} onCambio={(v) => editar('pasos', p.id, { fecha: v || null })} />
              </Fila>
              <Boton texto="Quitar paso" chico tipo="gh" onPress={() => borrar('pasos', p.id)} style={{ alignSelf: 'flex-start' }} />
            </View>
          ) : null}
        </View>
      ))}
      <Fila>
        <View style={{ flex: 1 }}>
          <Campo value={nuevo} onChangeText={setNuevo} placeholder="Agregar paso (ej: Conseguir el corte en la carnicería)" onSubmitEditing={agregar} />
        </View>
        <Boton texto="Agregar" onPress={agregar} deshabilitado={!nuevo.trim()} />
      </Fila>
    </Card>
  );
}

/* ---------------- Propuestas ---------------- */
function Propuestas({ idea, props }: { idea: Idea; props: Propuesta[] }) {
  const { crear, editar, avisar } = useDatos();
  const { email } = useSesion();
  const [tipo, setTipo] = useState<TipoPropuesta>('mejora');
  const [texto, setTexto] = useState('');
  const [pedido, setPedido] = useState('');
  const [pensando, setPensando] = useState(false);
  const [verResueltas, setVerResueltas] = useState(false);
  const pendientes = props.filter((p) => p.estado === 'pendiente');
  const resueltas = props.filter((p) => p.estado !== 'pendiente');


  const proponer = async () => {
    if (!texto.trim()) return;
    await crear('propuestas', { idea_id: idea.id, tipo, texto: texto.trim(), autor: email });
    setTexto('');
  };

  const pedirIA = async () => {
    setPensando(true);
    try {
      const r = leerJSON<{ propuestas: { tipo: string; texto: string }[] }>(await preguntarIA(promptPropuestas(idea, props, pedido)));
      for (const p of r.propuestas ?? []) {
        if (!p.texto) continue;
        await crear('propuestas', { idea_id: idea.id, tipo: esTipoPropuesta(p.tipo) ? p.tipo : 'mejora', texto: p.texto, autor: 'IA', es_ia: true });
      }
      setPedido('');
      avisar('La IA dejó sus propuestas');
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'No se pudo generar');
    }
    setPensando(false);
  };

  const aceptar = async (p: Propuesta) => {
    const campo = TIPOS_PROPUESTA[p.tipo].campo;
    if (campo) await editar('ideas', idea.id, { [campo]: p.texto });
    await editar('propuestas', p.id, { estado: 'aceptada', resuelta_por: email });
    avisar(campo ? `Propuesta aplicada al ${TIPOS_PROPUESTA[p.tipo].n.toLowerCase()}` : 'Propuesta aceptada');
  };

  return (
    <Card>
      <Fila entre>
        <Titulo tam={18}>Propuestas</Titulo>
        <Tag texto={`${pendientes.length} por revisar`} aviso={pendientes.length > 0} />
      </Fila>
      <Tenue tam={13}>Las propuestas no cambian nada hasta que alguien las acepta. Si es un título, gancho, guion o cierre, al aceptarla reemplaza ese campo.</Tenue>
      {pendientes.map((p) => (
        <TarjetaPropuesta key={p.id} p={p} aceptar={() => aceptar(p)} descartar={() => editar('propuestas', p.id, { estado: 'descartada', resuelta_por: email })} />
      ))}
      {!pendientes.length ? <Vacio>Sin propuestas pendientes.</Vacio> : null}

      <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: colors.linea, paddingTop: 12 }}>
        <Etiqueta>Pedir propuestas a la IA</Etiqueta>
        <Fila>
          <View style={{ flex: 1 }}>
            <Campo value={pedido} onChangeText={setPedido} placeholder="Opcional: “3 ganchos más polémicos”, “versión para Kunstmann”…" />
          </View>
          <Boton texto={pensando ? 'Pensando…' : '✦ Proponer'} tipo="pri" onPress={pedirIA} cargando={pensando} />
        </Fila>
      </View>
      <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: colors.linea, paddingTop: 12 }}>
        <Etiqueta>Dejar una propuesta</Etiqueta>
        <Chips valor={tipo} onCambio={setTipo} opciones={Object.entries(TIPOS_PROPUESTA).map(([k, v]) => [k as TipoPropuesta, v.n] as [TipoPropuesta, string])} />
        <Campo value={texto} onChangeText={setTexto} multiline placeholder="Escribe tu propuesta" style={{ minHeight: 70 }} />
        <Boton texto="Proponer" onPress={proponer} deshabilitado={!texto.trim()} style={{ alignSelf: 'flex-end' }} />
      </View>
      {resueltas.length ? (
        <View style={{ gap: 8 }}>
          <Boton texto={`${verResueltas ? 'Ocultar' : 'Ver'} historial (${resueltas.length})`} chico tipo="gh" onPress={() => setVerResueltas(!verResueltas)} style={{ alignSelf: 'flex-start' }} />
          {verResueltas ? resueltas.map((p) => <TarjetaPropuesta key={p.id} p={p} reabrir={() => editar('propuestas', p.id, { estado: 'pendiente', resuelta_por: '' })} />) : null}
        </View>
      ) : null}
    </Card>
  );
}

function TarjetaPropuesta({ p, aceptar, descartar, reabrir }: { p: Propuesta; aceptar?: () => void; descartar?: () => void; reabrir?: () => void }) {
  const [abierta, setAbierta] = useState(p.texto.length < 260);
  return (
    <View style={{ backgroundColor: colors.s2, borderWidth: 1, borderColor: colors.linea, borderLeftWidth: 3, borderLeftColor: p.es_ia ? colors.brasa : colors.tenue, borderRadius: 10, padding: 12, gap: 6, opacity: p.estado === 'pendiente' ? 1 : 0.7 }}>
      <Fila entre>
        <Fila gap={6}>
          <Tag texto={TIPOS_PROPUESTA[p.tipo].n} />
          <Tenue tam={11}>
            {p.es_ia ? '✦ IA' : p.autor.split('@')[0]} · {fd(p.creado)}
          </Tenue>
        </Fila>
        {p.estado !== 'pendiente' ? <Tag texto={p.estado === 'aceptada' ? '✓ aceptada' : 'descartada'} /> : null}
      </Fila>
      <Pressable onPress={() => setAbierta(!abierta)}>
        <Texto lineas={abierta ? undefined : 5}>{p.texto}</Texto>
        {!abierta ? <Tenue>Ver completa</Tenue> : null}
      </Pressable>
      <Fila style={{ justifyContent: 'flex-end' }}>
        {descartar ? <Boton texto="Descartar" chico tipo="gh" onPress={descartar} /> : null}
        {aceptar ? <Boton texto={TIPOS_PROPUESTA[p.tipo].campo ? 'Aceptar y aplicar' : 'Aceptar'} chico tipo="pri" onPress={aceptar} /> : null}
        {reabrir ? <Boton texto="Volver a pendiente" chico tipo="gh" onPress={reabrir} /> : null}
      </Fila>
    </View>
  );
}
