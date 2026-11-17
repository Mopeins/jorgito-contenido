import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Boton, Card, Encabezado, Fila, Pill, Tenue, Texto, Titulo } from '@/components/ui';
import { PILARES, PK } from '@/lib/contenido';
import { colors, pilarColor } from '@/lib/theme';
import { useDatos } from '@/providers/datos';

export default function Pilares() {
  const router = useRouter();
  const { ideas } = useDatos();
  return (
    <View>
      <Encabezado titulo="Pilares de contenido" bajada="A quién le habla cada pilar y qué tipo de video entra ahí." />
      <Fila gap={16} wrap style={{ alignItems: 'stretch' }}>
        {PK.map((p) => (
          <Card key={p} borde={pilarColor[p]} style={{ flexBasis: 300, flexGrow: 1 }}>
            <Fila entre>
              <Titulo tam={18}>{PILARES[p].n}</Titulo>
              <Pill pilar={p} />
            </Fila>
            <Texto>
              <Texto peso="bold">Público: </Texto>
              {PILARES[p].pub}
            </Texto>
            <Tenue tam={13}>{PILARES[p].desc}</Tenue>
            {PILARES[p].ej.map((e) => (
              <Fila key={e} gap={8} style={{ alignItems: 'flex-start' }}>
                <Texto color={pilarColor[p]}>•</Texto>
                <Tenue tam={13} style={{ flex: 1 }}>
                  {e}
                </Tenue>
              </Fila>
            ))}
            <Fila wrap style={{ marginTop: 'auto' }}>
              <Boton texto="Generar ideas" chico onPress={() => router.push({ pathname: '/generador', params: { modo: 'pilar', pilar: p } } as never)} />
              <Tenue>{ideas.filter((i) => i.pilar === p).length} ideas</Tenue>
            </Fila>
          </Card>
        ))}
        <Card style={{ flexBasis: 300, flexGrow: 1 }}>
          <Titulo tam={18}>Rutina semanal</Titulo>
          {[
            ['Cada mañana', 'el radar revisa a los referentes y deja oportunidades.'],
            ['Lunes', 'subir métricas, generar el informe y armar la semana en el tablero.'],
            ['Cada idea', 'avanza por su flujo: validar, guion, insumos, grabar, editar, copy, publicar y revisar.'],
            ['Cada Día D', '3 piezas: receta, truco y versus.'],
            ['Enfrentamientos', 'votación distinta en cada red; Facebook vota con reacciones.'],
          ].map(([a, b]) => (
            <Texto key={a} color={colors.tenue}>
              <Texto peso="bold">{a}: </Texto>
              {b}
            </Texto>
          ))}
        </Card>
      </Fila>
    </View>
  );
}
