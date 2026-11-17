import { createElement } from 'react';
import { View } from 'react-native';

import { colors, fonts } from '@/lib/theme';

import { Etiqueta } from './ui';

/** En la web usa el selector de fecha del navegador */
export function CampoFecha({ etiqueta, valor, onCambio }: { etiqueta?: string; valor: string; onCambio: (v: string) => void }) {
  return (
    <View style={{ gap: 5, flexGrow: 1, minWidth: 150 }}>
      {etiqueta ? <Etiqueta>{etiqueta}</Etiqueta> : null}
      {createElement('input', {
        type: 'date',
        value: valor || '',
        onChange: (e: { target: { value: string } }) => onCambio(e.target.value),
        style: {
          background: colors.s2,
          border: `1px solid ${colors.linea}`,
          borderRadius: 9,
          padding: '8px 10px',
          color: colors.tinta,
          fontFamily: fonts.texto,
          fontSize: 14,
          colorScheme: 'dark',
          outline: 'none',
        },
      })}
    </View>
  );
}
