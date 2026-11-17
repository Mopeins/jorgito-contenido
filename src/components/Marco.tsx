import { usePathname, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/lib/theme';
import { useDatos } from '@/providers/datos';
import { useSesion } from '@/providers/sesion';

import { Icono, type NombreIcono } from './Icono';
import { Fila, Logo, Tenue, Texto } from './ui';

const NAV: [string, string, NombreIcono][] = [
  ['/', 'Hoy', 'hoy'],
  ['/calendario', 'Calendario', 'calendario'],
  ['/ideas', 'Ideas', 'ideas'],
  ['/generador', 'Generador', 'generador'],
  ['/radar', 'Radar', 'radar'],
  ['/metricas', 'Métricas', 'metricas'],
  ['/pilares', 'Pilares', 'pilares'],
  ['/equipo', 'Equipo', 'equipo'],
];

export function Marco({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const ancho = width >= 900;
  const ruta = usePathname();
  const router = useRouter();
  const { email, cerrarSesion } = useSesion();
  const { aviso } = useDatos();
  const ins = useSafeAreaInsets();
  const activo = (r: string) => (r === '/' ? ruta === '/' : ruta.startsWith(r) || (r === '/ideas' && ruta.startsWith('/idea/')));

  const nav = NAV.filter((n) => ancho || n[0] !== '/pilares');
  return (
    <View style={{ flex: 1, flexDirection: ancho ? 'row' : 'column', backgroundColor: colors.fondo }}>
      {ancho ? (
        <View style={{ width: 230, backgroundColor: colors.s1, borderRightWidth: 1, borderRightColor: colors.linea, paddingVertical: 18, paddingHorizontal: 12, gap: 2 }}>
          <Fila gap={10} style={{ paddingHorizontal: 8, paddingBottom: 18 }}>
            <Logo />
            <View>
              <Texto tam={15} peso="tituloMedio">
                Central de Contenido
              </Texto>
              <Tenue>Jorgito Parrillero</Tenue>
            </View>
          </Fila>
          {nav.map(([r, n, ic]) => (
            <Pressable
              key={r}
              onPress={() => router.navigate(r as never)}
              style={(s) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 9,
                paddingHorizontal: 10,
                borderRadius: 9,
                backgroundColor: activo(r) ? colors.s3 : (s as { hovered?: boolean }).hovered ? colors.s2 : 'transparent',
              })}
            >
              <Icono nombre={ic} color={activo(r) ? colors.tinta : colors.tenue} />
              <Texto peso="medio" color={activo(r) ? colors.tinta : colors.tenue}>
                {n}
              </Texto>
            </Pressable>
          ))}
          <View style={{ flex: 1 }} />
          <View style={{ paddingHorizontal: 10, gap: 4 }}>
            <Tenue lineas={1}>{email}</Tenue>
            <Pressable onPress={cerrarSesion}>
              <Texto tam={12} color={colors.brasa2}>
                Cerrar sesión
              </Texto>
            </Pressable>
          </View>
        </View>
      ) : null}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: ancho ? 32 : 16, paddingTop: ancho ? 28 : 16 + ins.top, paddingBottom: 100, maxWidth: 1280, width: '100%' }}>
        {children}
      </ScrollView>
      {!ancho ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.s1, borderTopWidth: 1, borderTopColor: colors.linea, paddingTop: 6, paddingBottom: 6 + ins.bottom }}>
          {nav.map(([r, n, ic]) => (
            <Pressable key={r} onPress={() => router.navigate(r as never)} style={{ alignItems: 'center', gap: 2, paddingHorizontal: 4 }}>
              <Icono nombre={ic} color={activo(r) ? colors.brasa : colors.tenue} tam={20} />
              <Texto tam={10} color={activo(r) ? colors.tinta : colors.tenue}>
                {n}
              </Texto>
            </Pressable>
          ))}
        </View>
      ) : null}
      {aviso ? (
        <View pointerEvents="none" style={{ position: 'absolute', bottom: ancho ? 24 : 90, left: 0, right: 0, alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.s3, borderWidth: 1, borderColor: colors.linea, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, maxWidth: 420 }}>
            <Texto>{aviso}</Texto>
          </View>
        </View>
      ) : null}
    </View>
  );
}
