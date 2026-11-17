import { Slot } from 'expo-router';

import { Marco } from '@/components/Marco';
import { Cargando } from '@/components/ui';
import { DatosProvider, useDatos } from '@/providers/datos';

function Contenido() {
  const { listo } = useDatos();
  return <Marco>{listo ? <Slot /> : <Cargando />}</Marco>;
}

export default function AppLayout() {
  return (
    <DatosProvider>
      <Contenido />
    </DatosProvider>
  );
}
