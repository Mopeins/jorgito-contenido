import { createElement, useRef } from 'react';
import { Pressable } from 'react-native';

import { colors } from '@/lib/theme';

import { Texto } from './ui';

/** Botón para elegir una imagen; entrega base64 sin el prefijo data: */
export function SubirImagen({ texto, onImagen }: { texto: string; onImagen: (img: { data: string; media_type: string }) => void }) {
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <Pressable
      onPress={() => ref.current?.click()}
      style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: colors.linea, borderRadius: 10, padding: 14, alignItems: 'center' }}
    >
      <Texto color={colors.tenue} style={{ textAlign: 'center' }}>
        {texto}
      </Texto>
      {createElement('input', {
        ref,
        type: 'file',
        accept: 'image/png,image/jpeg,image/webp',
        style: { display: 'none' },
        onChange: (e: { target: HTMLInputElement }) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = () => {
            const s = String(r.result);
            onImagen({ data: s.slice(s.indexOf(',') + 1), media_type: f.type || 'image/png' });
          };
          r.readAsDataURL(f);
          e.target.value = '';
        },
      })}
    </Pressable>
  );
}
