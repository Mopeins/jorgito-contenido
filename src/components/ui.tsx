import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { PILARES } from '@/lib/contenido';
import { alfa, colors, fonts, pilarColor } from '@/lib/theme';
import type { Pilar } from '@/lib/tipos';

export function Texto({
  children,
  tam = 14,
  color = colors.tinta,
  peso = 'normal',
  style,
  lineas,
  onPress,
}: {
  children: ReactNode;
  onPress?: () => void;
  tam?: number;
  color?: string;
  peso?: 'normal' | 'medio' | 'bold' | 'titulo' | 'tituloMedio';
  style?: StyleProp<TextStyle>;
  lineas?: number;
}) {
  const f = { normal: fonts.texto, medio: fonts.textoMedio, bold: fonts.textoBold, titulo: fonts.titulo, tituloMedio: fonts.tituloMedio }[peso];
  return (
    <Text numberOfLines={lineas} onPress={onPress} style={[{ fontFamily: f, fontSize: tam, color, lineHeight: Math.round(tam * 1.45) }, style]}>
      {children}
    </Text>
  );
}

export const Tenue = (p: { children: ReactNode; tam?: number; style?: StyleProp<TextStyle>; lineas?: number }) => (
  <Texto tam={p.tam ?? 12} color={colors.tenue} style={p.style} lineas={p.lineas}>
    {p.children}
  </Texto>
);

export function Titulo({ children, tam = 28, style }: { children: ReactNode; tam?: number; style?: StyleProp<TextStyle> }) {
  return (
    <Texto tam={tam} peso={tam >= 22 ? 'titulo' : 'tituloMedio'} style={[{ letterSpacing: -0.3 }, style]}>
      {children}
    </Texto>
  );
}

export function Boton({
  texto,
  onPress,
  tipo = 'normal',
  chico,
  deshabilitado,
  cargando,
  style,
}: {
  texto: string;
  onPress?: () => void;
  tipo?: 'normal' | 'pri' | 'gh' | 'peligro';
  chico?: boolean;
  deshabilitado?: boolean;
  cargando?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg = tipo === 'pri' ? colors.brasa : tipo === 'gh' ? 'transparent' : colors.s3;
  const fg = tipo === 'pri' ? colors.sobreBrasa : tipo === 'peligro' ? colors.rojo : colors.tinta;
  return (
    <Pressable
      onPress={deshabilitado || cargando ? undefined : onPress}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        {
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: tipo === 'pri' ? colors.brasa : hovered ? colors.tenue2 : tipo === 'gh' ? 'transparent' : colors.linea,
          borderRadius: chico ? 7 : 9,
          paddingVertical: chico ? 4 : 8,
          paddingHorizontal: chico ? 9 : 13,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          opacity: deshabilitado ? 0.5 : pressed ? 0.8 : 1,
        },
        tipo === 'pri' && hovered ? { backgroundColor: colors.brasa2 } : null,
        style,
      ]}
    >
      {cargando ? <ActivityIndicator size="small" color={fg} /> : null}
      <Texto tam={chico ? 12 : 14} peso={tipo === 'pri' ? 'bold' : 'medio'} color={fg}>
        {texto}
      </Texto>
    </Pressable>
  );
}

export function Pill({ pilar }: { pilar: Pilar | string }) {
  const c = pilarColor[pilar as Pilar];
  if (!c) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: alfa(c, 0.18), paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, alignSelf: 'flex-start' }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c }} />
      <Texto tam={11} peso="bold" color={c}>
        {PILARES[pilar as Pilar].n}
      </Texto>
    </View>
  );
}

export function Tag({ texto, aviso, color }: { texto: string; aviso?: boolean; color?: string }) {
  return (
    <View style={{ backgroundColor: aviso ? colors.avisoFondo : colors.s3, paddingHorizontal: 7, paddingVertical: 1, borderRadius: 6, alignSelf: 'flex-start' }}>
      <Texto tam={11} color={color ?? (aviso ? colors.aviso : colors.tenue)}>
        {texto}
      </Texto>
    </View>
  );
}

export function Card({ children, style, borde }: { children: ReactNode; style?: StyleProp<ViewStyle>; borde?: string }) {
  return (
    <View
      style={[
        { backgroundColor: colors.s1, borderWidth: 1, borderColor: colors.linea, borderRadius: 12, padding: 16, gap: 10 },
        borde ? { borderTopWidth: 3, borderTopColor: borde } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Chip({ texto, activo, onPress }: { texto: string; activo?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: activo ? colors.tenue2 : colors.linea,
        backgroundColor: activo ? colors.s3 : 'transparent',
        borderRadius: 99,
        paddingVertical: 5,
        paddingHorizontal: 11,
      }}
    >
      <Texto tam={12} peso="medio" color={activo ? colors.tinta : colors.tenue}>
        {texto}
      </Texto>
    </Pressable>
  );
}

export function Chips<T extends string>({ opciones, valor, onCambio }: { opciones: [T, string][]; valor: T; onCambio: (v: T) => void }) {
  return (
    <Fila gap={6} wrap>
      {opciones.map(([k, n]) => (
        <Chip key={k} texto={n} activo={valor === k} onPress={() => onCambio(k)} />
      ))}
    </Fila>
  );
}

export function ChipsMulti({ opciones, valor, onCambio }: { opciones: string[]; valor: string[]; onCambio: (v: string[]) => void }) {
  return (
    <Fila gap={6} wrap>
      {opciones.map((k) => (
        <Chip key={k} texto={k} activo={valor.includes(k)} onPress={() => onCambio(valor.includes(k) ? valor.filter((x) => x !== k) : [...valor, k])} />
      ))}
    </Fila>
  );
}

export function Campo({ etiqueta, style, multiline, ...p }: TextInputProps & { etiqueta?: string }) {
  return (
    <View style={{ gap: 5, flexGrow: 1, flexShrink: 1, minWidth: 140 }}>
      {etiqueta ? (
        <Texto tam={12} peso="medio" color={colors.tenue}>
          {etiqueta}
        </Texto>
      ) : null}
      <TextInput
        placeholderTextColor={colors.tenue2}
        multiline={multiline}
        style={[
          {
            backgroundColor: colors.s2,
            borderWidth: 1,
            borderColor: colors.linea,
            borderRadius: 9,
            paddingHorizontal: 10,
            paddingVertical: 8,
            color: colors.tinta,
            fontFamily: fonts.texto,
            fontSize: 14,
            minHeight: multiline ? 90 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          style,
        ]}
        {...p}
      />
    </View>
  );
}

export function Etiqueta({ children }: { children: ReactNode }) {
  return (
    <Texto tam={12} peso="medio" color={colors.tenue}>
      {children}
    </Texto>
  );
}

export function Fila({
  children,
  gap = 8,
  wrap,
  entre,
  style,
}: {
  children: ReactNode;
  gap?: number;
  wrap?: boolean;
  entre?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap, flexWrap: wrap ? 'wrap' : 'nowrap', justifyContent: entre ? 'space-between' : 'flex-start' }, style]}>
      {children}
    </View>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return (
    <View style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: colors.linea, borderRadius: 10, padding: 18, alignItems: 'center' }}>
      <Texto color={colors.tenue} style={{ textAlign: 'center' }}>
        {children}
      </Texto>
    </View>
  );
}

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 30, backgroundColor: colors.fondo }}>
      <ActivityIndicator color={colors.brasa} />
      <Tenue tam={13}>{texto}</Tenue>
    </View>
  );
}

export function Encabezado({ titulo, bajada, children }: { titulo: string; bajada?: string; children?: ReactNode }) {
  return (
    <Fila entre wrap gap={14} style={{ alignItems: 'flex-end', marginBottom: 20 }}>
      <View style={{ gap: 4, flexShrink: 1 }}>
        <Titulo>{titulo}</Titulo>
        {bajada ? <Texto color={colors.tenue}>{bajada}</Texto> : null}
      </View>
      {children ? (
        <Fila gap={8} wrap>
          {children}
        </Fila>
      ) : null}
    </Fila>
  );
}

export function Logo({ tam = 40 }: { tam?: number }) {
  // En tamaños chicos solo se lee la firma "JP"; en grande va el logo completo con el texto circular.
  const completo = tam >= 90;
  return (
    <Image
      source={completo ? require('../../assets/images/logo.png') : require('../../assets/images/logo-jp.png')}
      style={{ width: tam, height: tam }}
      resizeMode="contain"
      accessibilityLabel="Jorgito Parrillero"
    />
  );
}

/** Caja con fecha grande (día + mes) para listas */
export function CajaFecha({ dia, mes }: { dia?: number; mes?: string }) {
  return (
    <View style={{ width: 46, backgroundColor: colors.s2, borderRadius: 9, paddingVertical: 4, alignItems: 'center' }}>
      {dia ? (
        <Texto tam={18} peso="titulo" style={{ lineHeight: 20 }}>
          {dia}
        </Texto>
      ) : null}
      <Texto tam={10} color={colors.tenue} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {mes ?? 's/f'}
      </Texto>
    </View>
  );
}

/** Markdown muy simple: ### títulos, - viñetas y **negritas** */
export function Markdown({ texto }: { texto: string }) {
  const lineas = (texto || '').split('\n');
  const negritas = (l: string) =>
    l.split(/(\*\*[^*]+\*\*)/g).map((t, i) =>
      t.startsWith('**') ? (
        <Text key={i} style={{ fontFamily: fonts.textoBold }}>
          {t.slice(2, -2)}
        </Text>
      ) : (
        t
      ),
    );
  return (
    <View style={{ gap: 6 }}>
      {lineas.map((l, i) => {
        if (!l.trim()) return null;
        if (/^#{1,3} /.test(l))
          return (
            <Titulo key={i} tam={15} style={{ marginTop: 8 }}>
              {l.replace(/^#+ /, '')}
            </Titulo>
          );
        if (/^\s*[-*] /.test(l))
          return (
            <Fila key={i} gap={8} style={{ alignItems: 'flex-start' }}>
              <Texto color={colors.brasa}>•</Texto>
              <Texto style={{ flex: 1 }}>{negritas(l.replace(/^\s*[-*] /, ''))}</Texto>
            </Fila>
          );
        return <Texto key={i}>{negritas(l)}</Texto>;
      })}
    </View>
  );
}
