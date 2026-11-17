import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type NombreIcono = 'hoy' | 'calendario' | 'ideas' | 'generador' | 'radar' | 'metricas' | 'pilares' | 'equipo';

export function Icono({ nombre, color, tam = 18 }: { nombre: NombreIcono; color: string; tam?: number }) {
  const p = { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={tam} height={tam} viewBox="0 0 24 24">
      {nombre === 'hoy' && <Path {...p} d="M12 2c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 1 1.5 2 2 3 2-.5-2-1-4 0-7z" />}
      {nombre === 'calendario' && (
        <>
          <Rect {...p} x={3} y={5} width={18} height={16} rx={2} />
          <Path {...p} d="M3 10h18M8 3v4M16 3v4" />
        </>
      )}
      {nombre === 'ideas' && (
        <>
          <Rect {...p} x={3} y={4} width={5} height={16} rx={1.5} />
          <Rect {...p} x={10} y={4} width={5} height={10} rx={1.5} />
          <Rect {...p} x={17} y={4} width={4} height={13} rx={1.5} />
        </>
      )}
      {nombre === 'generador' && <Path {...p} d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />}
      {nombre === 'radar' && (
        <>
          <Circle {...p} cx={12} cy={12} r={9} />
          <Circle {...p} cx={12} cy={12} r={4} />
          <Path {...p} d="M12 12l6-6" />
        </>
      )}
      {nombre === 'metricas' && <Path {...p} d="M4 20V10M10 20V4M16 20v-7M22 20H2" />}
      {nombre === 'pilares' && <Path {...p} d="M4 21V8M10 21V8M14 21V8M20 21V8M2 21h20M12 3l9 4H3z" />}
      {nombre === 'equipo' && (
        <>
          <Circle {...p} cx={9} cy={8} r={3.5} />
          <Path {...p} d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3.2 2.6 3.5 5.5" />
        </>
      )}
    </Svg>
  );
}
