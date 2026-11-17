import { useState } from 'react';
import { Platform, View } from 'react-native';

import { Boton, Campo, Card, Logo, Tenue, Texto, Titulo } from '@/components/ui';
import { mensajeError, supabase } from '@/lib/supabase';
import { colors } from '@/lib/theme';

/** Cuenta compartida del equipo: se entra solo con la clave. */
const CUENTA_EQUIPO = 'equipo@jorgitoparrillero.cl';

/** Entrada con la clave del equipo, o con código al correo para quien tenga su propia cuenta. */
export default function Entrar() {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [paso, setPaso] = useState<'clave' | 'correo' | 'codigo'>('clave');
  const [clave, setClave] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const entrarConClave = async () => {
    if (!clave) return;
    setCargando(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: CUENTA_EQUIPO, password: clave });
    setCargando(false);
    if (err) setError('Clave incorrecta');
  };

  const pedir = async () => {
    const e = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return setError('Escribe un correo válido');
    setCargando(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email: e,
      options: { shouldCreateUser: true, emailRedirectTo: Platform.OS === 'web' ? window.location.origin : undefined },
    });
    setCargando(false);
    if (err) return setError(mensajeError(err));
    setPaso('codigo');
  };

  const verificar = async () => {
    setCargando(true);
    setError('');
    const { error: err } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: codigo.trim(), type: 'email' });
    setCargando(false);
    if (err) setError('Código incorrecto o vencido. Pide uno nuevo.');
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.fondo }}>
      <Card style={{ width: '100%', maxWidth: 380, padding: 28, gap: 14, alignItems: 'stretch' }}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Logo tam={56} />
          <Titulo tam={22}>Central de Contenido</Titulo>
          <Tenue tam={13} style={{ textAlign: 'center' }}>
            Jorgito Parrillero · {paso === 'clave' ? 'Ingresa la clave del equipo' : paso === 'correo' ? 'Entra con tu correo del equipo' : `Te mandamos un código a ${email.trim()}`}
          </Tenue>
        </View>
        {paso === 'clave' ? (
          <>
            <Campo value={clave} onChangeText={setClave} placeholder="Clave" secureTextEntry autoCapitalize="none" autoComplete="current-password" onSubmitEditing={entrarConClave} style={{ textAlign: 'center', fontSize: 16 }} />
            <Boton texto="Entrar" tipo="pri" onPress={entrarConClave} cargando={cargando} deshabilitado={!clave} />
            <Boton texto="Entrar con mi correo" tipo="gh" chico onPress={() => { setError(''); setPaso('correo'); }} />
          </>
        ) : paso === 'correo' ? (
          <>
            <Campo value={email} onChangeText={setEmail} placeholder="tucorreo@ejemplo.cl" autoCapitalize="none" keyboardType="email-address" autoComplete="email" onSubmitEditing={pedir} />
            <Boton texto="Enviar código" tipo="pri" onPress={pedir} cargando={cargando} />
            <Boton texto="← Entrar con la clave" tipo="gh" chico onPress={() => { setError(''); setPaso('clave'); }} />
          </>
        ) : (
          <>
            <Campo
              value={codigo}
              onChangeText={(t) => setCodigo(t.replace(/\D/g, '').slice(0, 8))}
              placeholder="Código del correo"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              onSubmitEditing={verificar}
              style={{ fontSize: 22, letterSpacing: 4, textAlign: 'center' }}
            />
            <Boton texto="Entrar" tipo="pri" onPress={verificar} cargando={cargando} deshabilitado={codigo.length < 6} />
            <Boton texto="Usar otro correo" tipo="gh" chico onPress={() => setPaso('correo')} />
            <Tenue style={{ textAlign: 'center' }}>Si el correo trae un enlace en vez de código, ábrelo en este mismo navegador.</Tenue>
          </>
        )}
        {error ? (
          <Texto tam={13} color={colors.rojo} style={{ textAlign: 'center' }}>
            {error}
          </Texto>
        ) : null}
      </Card>
    </View>
  );
}
