import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';

import { useNuevaIdea } from '@/components/Filas';
import { Boton, Campo, Card, Chip, Chips, Fila, Tag, Tenue, Texto, Titulo, Vacio } from '@/components/ui';
import { colors } from '@/lib/theme';
import type { Hook, TipoHook } from '@/lib/tipos';
import { useDatos } from '@/providers/datos';

export const TIPOS_HOOK: [TipoHook, string][] = [
  ['desafio', 'Desafío'],
  ['comparacion', 'Comparación'],
  ['pregunta', 'Pregunta'],
  ['promesa', 'Promesa'],
  ['polemica', 'Polémica'],
  ['curiosidad', 'Curiosidad'],
  ['historia', 'Historia'],
];
const tipoN = (t: string) => TIPOS_HOOK.find((x) => x[0] === t)?.[1] ?? t;

/** Radar de hooks: ganchos que están funcionando y su versión para Jorgito */
export function RadarHooks({ ancho }: { ancho: boolean }) {
  const { hooks, crear, editar, borrar } = useDatos();
  const nueva = useNuevaIdea();
  const [f, setF] = useState<'todos' | 'favoritos' | TipoHook>('todos');
  const [orig, setOrig] = useState('');
  const [adap, setAdap] = useState('');
  const [tipo, setTipo] = useState<TipoHook>('curiosidad');
  const [ref, setRef] = useState('');
  const lista = hooks.filter((h) => f === 'todos' || (f === 'favoritos' ? h.favorito : h.tipo === f));

  return (
    <View style={{ flexDirection: ancho ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
      <View style={{ flex: ancho ? 2 : undefined, width: ancho ? undefined : '100%', gap: 12 }}>
        <Fila gap={6} wrap>
          <Chip texto={`Todos (${hooks.length})`} activo={f === 'todos'} onPress={() => setF('todos')} />
          <Chip texto={`★ Favoritos (${hooks.filter((h) => h.favorito).length})`} activo={f === 'favoritos'} onPress={() => setF('favoritos')} />
          {TIPOS_HOOK.map(([k, n]) => (
            <Chip key={k} texto={n} activo={f === k} onPress={() => setF(k)} />
          ))}
        </Fila>
        {lista.map((h) => (
          <TarjetaHook
            key={h.id}
            h={h}
            fav={() => editar('hooks', h.id, { favorito: !h.favorito })}
            usar={async () => {
              await editar('hooks', h.id, { usado: true });
              await nueva({ titulo: 'Idea con gancho: ' + (h.adaptado || h.original).slice(0, 60), gancho: h.adaptado || h.original, origen: 'Radar de hooks', notas: h.link ? 'Referencia: ' + h.link : '' });
            }}
            quitar={() => borrar('hooks', h.id)}
          />
        ))}
        {!lista.length ? <Vacio>Sin hooks en esta lista. El radar diario los va sumando cada mañana.</Vacio> : null}
      </View>
      <Card style={{ flex: ancho ? 1 : undefined, width: ancho ? undefined : '100%' }}>
        <Titulo tam={18}>Guardar un hook</Titulo>
        <Tenue tam={13}>¿Viste un gancho bueno? Guárdalo aquí con su versión para Jorgito.</Tenue>
        <Campo etiqueta="Gancho original" value={orig} onChangeText={setOrig} multiline style={{ minHeight: 60 }} placeholder="Ej: I tried EVERY steak in America" />
        <Campo etiqueta="Versión Jorgito (opcional)" value={adap} onChangeText={setAdap} multiline style={{ minHeight: 60 }} />
        <Chips valor={tipo} onCambio={setTipo} opciones={TIPOS_HOOK} />
        <Campo etiqueta="De quién" value={ref} onChangeText={setRef} placeholder="Ej: Max the Meat Guy" />
        <Boton
          texto="Guardar"
          tipo="pri"
          deshabilitado={!orig.trim()}
          style={{ alignSelf: 'flex-start' }}
          onPress={async () => {
            if (await crear('hooks', { original: orig.trim(), adaptado: adap.trim(), tipo, referente: ref.trim() })) {
              setOrig('');
              setAdap('');
              setRef('');
            }
          }}
        />
      </Card>
    </View>
  );
}

function TarjetaHook({ h, fav, usar, quitar }: { h: Hook; fav: () => void; usar: () => void; quitar: () => void }) {
  const [confirmar, setConfirmar] = useState(false);
  return (
    <Card style={{ borderLeftWidth: 3, borderLeftColor: h.favorito ? colors.aviso : colors.brasa }}>
      <Fila entre wrap>
        <Fila gap={6} wrap>
          <Tag texto={tipoN(h.tipo)} />
          {h.referente ? <Texto peso="bold">{h.referente}</Texto> : null}
          {h.plataforma ? <Tag texto={h.plataforma} /> : null}
          {h.vistas ? <Tag texto={h.vistas} aviso /> : null}
          {h.usado ? <Tag texto="✓ usado" /> : null}
        </Fila>
        <Pressable onPress={fav} hitSlop={8}>
          <Texto tam={20} color={h.favorito ? colors.aviso : colors.tenue2}>
            {h.favorito ? '★' : '☆'}
          </Texto>
        </Pressable>
      </Fila>
      <Texto color={colors.tenue}>“{h.original}”</Texto>
      {h.adaptado ? (
        <View style={{ backgroundColor: colors.s2, borderRadius: 9, padding: 10, gap: 2 }}>
          <Texto tam={11} peso="bold" color={colors.brasa2} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Versión Jorgito
          </Texto>
          <Texto tam={16} peso="bold">
            {h.adaptado}
          </Texto>
        </View>
      ) : null}
      {h.por_que ? <Tenue tam={13}>Por qué funciona: {h.por_que}</Tenue> : null}
      <Fila wrap>
        <Boton texto="Usar en una idea nueva" chico tipo="pri" onPress={usar} />
        {/^https?:\/\//.test(h.link) ? <Boton texto="Ver original" chico onPress={() => Linking.openURL(h.link)} /> : null}
        {confirmar ? (
          <>
            <Boton texto="Sí, quitar" chico tipo="peligro" onPress={quitar} />
            <Boton texto="No" chico tipo="gh" onPress={() => setConfirmar(false)} />
          </>
        ) : (
          <Boton texto="Quitar" chico tipo="gh" onPress={() => setConfirmar(true)} />
        )}
      </Fila>
    </Card>
  );
}
