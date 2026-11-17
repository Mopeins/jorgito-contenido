import { Campo } from './ui';

/** En el teléfono: fecha escrita como AAAA-MM-DD */
export function CampoFecha({ etiqueta, valor, onCambio }: { etiqueta?: string; valor: string; onCambio: (v: string) => void }) {
  return <Campo etiqueta={etiqueta} value={valor} onChangeText={onCambio} placeholder="AAAA-MM-DD" maxLength={10} />;
}
