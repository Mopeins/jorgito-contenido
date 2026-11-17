import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// La URL y la clave publicable son públicas por diseño: los permisos los pone la base de datos (RLS).
const url = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://djbucoegivrcqojipfse.supabase.co';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_RCrUIg4AyBiDBt80D7pP6w_Z6S-zpWr';

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: Platform.OS === 'web' && typeof window === 'undefined' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

export function mensajeError(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message;
  }
  return 'Algo salió mal. Intenta de nuevo.';
}
