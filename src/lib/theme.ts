export const colors = {
  fondo: '#0D0D0D',
  s1: '#161616',
  s2: '#1F1F1F',
  s3: '#2A2A2A',
  linea: '#363636',
  tinta: '#FFFFFF',
  tenue: '#A3A3A3',
  tenue2: '#767676',
  brasa: '#E32626',
  brasa2: '#FF5A5A',
  sobreBrasa: '#FFFFFF',
  rojo: '#FF6B6B',
  aviso: '#F2B544',
  avisoFondo: '#3A2E14',
} as const;

export const pilarColor = {
  recetas: '#F2B544',
  trucos: '#FF7A3D',
  tendencias: '#B98CFF',
  versus: '#4FC3F7',
  efemerides: '#7BD88F',
} as const;

export const plataformaColor: Record<string, string> = {
  Instagram: '#E32626',
  Facebook: '#4FC3F7',
  TikTok: '#B98CFF',
  YouTube: '#F2B544',
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
