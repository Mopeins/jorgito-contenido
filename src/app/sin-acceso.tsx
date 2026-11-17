import { View } from 'react-native';

import { Boton, Card, Fila, Logo, Tenue, Titulo } from '@/components/ui';
import { colors } from '@/lib/theme';
import { useSesion } from '@/providers/sesion';

export default function SinAcceso() {
  const { email, cerrarSesion, revisarAcceso } = useSesion();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.fondo }}>
      <Card style={{ width: '100%', maxWidth: 380, padding: 28, alignItems: 'center', gap: 12 }}>
        <Logo tam={150} />
        <Titulo tam={22}>Sin acceso</Titulo>
        <Tenue tam={13} style={{ textAlign: 'center' }}>
          {email} no está en el equipo. Pídele a Ignacio que te agregue y vuelve a intentar.
        </Tenue>
        <Fila>
          <Boton texto="Volver a revisar" onPress={revisarAcceso} />
          <Boton texto="Salir" tipo="gh" onPress={cerrarSesion} />
        </Fila>
      </Card>
    </View>
  );
}
