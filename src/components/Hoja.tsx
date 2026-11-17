import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView } from 'react-native';

import { colors } from '@/lib/theme';

export function Hoja({ children, cerrar }: { children: ReactNode; cerrar: () => void }) {
  return (
    <Modal transparent animationType="fade" onRequestClose={cerrar}>
      <Pressable onPress={cerrar} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.6)', alignItems: 'center', justifyContent: 'flex-start', padding: 16, paddingTop: 50 }}>
        <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 640, maxHeight: '90%' }}>
          <ScrollView style={{ backgroundColor: colors.s1, borderRadius: 16, borderWidth: 1, borderColor: colors.linea }} contentContainerStyle={{ padding: 22, gap: 12 }}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

