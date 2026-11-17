import { Vacio } from './ui';

/** En el teléfono, los pantallazos se suben desde la versión web */
export function SubirImagen(_: { texto: string; onImagen: (img: { data: string; media_type: string }) => void }) {
  return <Vacio>Sube el pantallazo desde la versión web.</Vacio>;
}
