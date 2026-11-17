export const colors = {
  fondo: '#FFFFFF',
  s1: '#F7F7F7',
  s2: '#EFEFEF',
  s3: '#E6E6E6',
  linea: '#DEDEDE',
  tinta: '#111111',
  tenue: '#5E5E5E',
  tenue2: '#8C8C8C',
  brasa: '#D71920',
  brasa2: '#B3141A',
  sobreBrasa: '#FFFFFF',
  rojo: '#B3141A',
  aviso: '#9A6700',
  avisoFondo: '#FFF3D1',
} as const;

export const pilarColor = {
  recetas: '#B45309',
  trucos: '#0F766E',
  tendencias: '#7C3AED',
  versus: '#1D4ED8',
  efemerides: '#15803D',
} as const;

export const plataformaColor: Record<string, string> = {
  Instagram: '#C13584',
  Facebook: '#1877F2',
  TikTok: '#111111',
  YouTube: '#D71920',
};

export const fonts = {
  titulo: 'BricolageGrotesque_800ExtraBold',
  tituloMedio: 'BricolageGrotesque_700Bold',
  texto: 'Inter_400Regular',
  textoMedio: 'Inter_500Medium',
  textoBold: 'Inter_600SemiBold',
} as const;

/** Mezcla un color hex con transparencia (para fondos de pastillas) */
export function alfa(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
