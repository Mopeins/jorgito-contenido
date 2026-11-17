export const colors = {
  fondo: '#13100E',
  s1: '#1C1815',
  s2: '#25201C',
  s3: '#2F2924',
  linea: '#3A332D',
  tinta: '#F4EDE6',
  tenue: '#A39A90',
  tenue2: '#7D746B',
  brasa: '#FF6B2C',
  brasa2: '#FF8F5C',
  sobreBrasa: '#1A0D05',
  rojo: '#E5534B',
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
  Instagram: '#FF6B2C',
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
