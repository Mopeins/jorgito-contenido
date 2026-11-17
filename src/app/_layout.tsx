import { BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/lib/theme';
import { SesionProvider, useSesion } from '@/providers/sesion';

SplashScreen.preventAutoHideAsync();

function Rutas() {
  const { session, acceso, cargando } = useSesion();
  const [fuentes] = useFonts({ BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  const listo = fuentes && !cargando;
  useEffect(() => {
    if (listo) SplashScreen.hideAsync();
  }, [listo]);
  if (!listo) return null;

  const conSesion = !!session;
  const autorizado = conSesion && acceso === 'ok';
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.fondo } }}>
      <Stack.Protected guard={!conSesion}>
        <Stack.Screen name="entrar" />
      </Stack.Protected>
      <Stack.Protected guard={conSesion && !autorizado}>
        <Stack.Screen name="sin-acceso" />
      </Stack.Protected>
      <Stack.Protected guard={autorizado}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SesionProvider>
        <StatusBar style="dark" />
        <Rutas />
      </SesionProvider>
    </SafeAreaProvider>
  );
}
