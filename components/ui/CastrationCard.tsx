// ============================================================
// components/cards/CastrationCard.tsx
// Tarjeta de turno de castración (usada en admin.tsx).
// ============================================================
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Castracion } from '../../types';
import { Badge, Card, DeleteButton, RowActions } from '../ui';

interface Props {
  turno: Castracion;
  onAprobar: () => void;
  onEspera: () => void;
  onRechazar: () => void;
  onEliminar: () => void;
}

export function CastrationCard({
  turno,
  onAprobar,
  onEspera,
  onRechazar,
  onEliminar,
}: Props) {
  return (
    <Card>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.titulo}>{turno.animalNombre}</Text>
          <Text style={s.subtitulo}>
            {turno.animalEspecie} · {turno.animalSexo}
          </Text>
        </View>
        <View style={s.headerRight}>
          <Badge status={turno.estadoTurno} />
          <DeleteButton onPress={onEliminar} />
        </View>
      </View>

      <View style={s.bloque}>
        <Row label="Dueño" value={turno.responsableNombre} />
        <Row label="DNI" value={turno.responsableDni} />
        <Row label="Teléfono" value={turno.responsableTelefono} />
      </View>

      {!!turno.notaDevolucion && (
        <View style={s.nota}>
          <Text style={s.notaText}>
            <Text style={{ fontWeight: '700' }}>Nota: </Text>
            {turno.notaDevolucion}
          </Text>
        </View>
      )}

      <RowActions
        onApprove={onAprobar}
        onInfo={onEspera}
        infoLabel="A espera"
        onReject={onRechazar}
      />
    </Card>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <Text style={rowS.text}>
      <Text style={rowS.label}>{label}: </Text>
      {value ?? '—'}
    </Text>
  );
}

const rowS = StyleSheet.create({
  text: { fontSize: 13, color: '#475569', marginBottom: 2 },
  label: { fontWeight: '600', color: '#334155' },
});

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  subtitulo: { fontSize: 12, color: '#64748b', marginTop: 2 },
  bloque: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 2,
  },
  nota: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  notaText: { fontSize: 13, color: '#92400e' },
});
