import { useState } from 'react';
import { View } from 'react-native';

import { Boton, Campo, Card, Chips, Encabezado, Fila, Tag, Tenue, Texto, Titulo } from '@/components/ui';
import { colors } from '@/lib/theme';
import { useDatos } from '@/providers/datos';
import { useSesion } from '@/providers/sesion';

export default function Equipo() {
  const { equipo, crear, borrar, editar } = useDatos();
  const { admin, email: yo, cerrarSesion } = useSesion();
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<'editor' | 'admin'>('editor');
  return (
    <View>
      <Encabezado titulo="Equipo" bajada="Solo los correos de esta lista pueden entrar y ver los datos. Se entra con un código que llega al correo.">
        <Boton texto="Cerrar sesión" tipo="gh" onPress={cerrarSesion} />
      </Encabezado>
      <Card style={{ maxWidth: 720 }}>
        {equipo.map((m) => (
          <Fila key={m.email} entre wrap style={{ borderTopWidth: 1, borderTopColor: colors.linea, paddingTop: 10 }}>
            <View style={{ gap: 2 }}>
              <Texto peso="bold">{m.nombre || m.email.split('@')[0]}</Texto>
              <Tenue>{m.email}</Tenue>
            </View>
            <Fila>
              <Tag texto={m.rol === 'admin' ? 'Admin' : 'Editor'} aviso={m.rol === 'admin'} />
              {admin && m.email !== yo ? (
                <>
                  <Boton texto={m.rol === 'admin' ? 'Hacer editor' : 'Hacer admin'} chico tipo="gh" onPress={() => editar('equipo', m.email, { rol: m.rol === 'admin' ? 'editor' : 'admin' }, 'email')} />
                  <Boton texto="Quitar" chico tipo="peligro" onPress={() => borrar('equipo', m.email, 'email')} />
                </>
              ) : null}
            </Fila>
          </Fila>
        ))}
        {admin ? (
          <View style={{ gap: 10, borderTopWidth: 1, borderTopColor: colors.linea, paddingTop: 14 }}>
            <Titulo tam={16}>Agregar persona</Titulo>
            <Fila wrap gap={10}>
              <Campo etiqueta="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="jorgito@ejemplo.cl" />
              <Campo etiqueta="Nombre" value={nombre} onChangeText={setNombre} placeholder="Jorgito" />
            </Fila>
            <Chips valor={rol} onCambio={setRol} opciones={[['editor', 'Editor (usa la app)'], ['admin', 'Admin (además maneja el equipo)']]} />
            <Boton
              texto="Agregar"
              tipo="pri"
              style={{ alignSelf: 'flex-start' }}
              deshabilitado={!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())}
              onPress={async () => {
                if (await crear('equipo', { email: email.trim().toLowerCase(), nombre: nombre.trim() || null, rol })) {
                  setEmail('');
                  setNombre('');
                }
              }}
            />
          </View>
        ) : (
          <Tenue tam={13}>Solo un admin puede agregar o quitar personas.</Tenue>
        )}
      </Card>
    </View>
  );
}
